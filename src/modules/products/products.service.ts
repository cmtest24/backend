import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  Inject,
  CACHE_MANAGER
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual } from 'typeorm';
import { Cache } from 'cache-manager';
import * as slugify from 'slugify';
import { Product, ProductStatus } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationOptions, PaginatedResult } from '../../common/interfaces/pagination.interface';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, CACHE_KEYS } from '../../common/constants';

interface ProductFilterOptions extends PaginationOptions {
  categoryId?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async findAll(options: ProductFilterOptions): Promise<PaginatedResult<Product>> {
    const { 
      page = 1, 
      limit = DEFAULT_PAGE_SIZE, 
      sortBy = 'createdAt', 
      order = 'DESC',
      categoryId,
      search,
      minPrice,
      maxPrice,
      inStock
    } = options;
    
    const take = Math.min(limit, MAX_PAGE_SIZE);
    const skip = (page - 1) * take;
    
    // Build query conditions
    const whereConditions: any = { status: ProductStatus.ACTIVE };
    
    if (categoryId) {
      whereConditions.categoryId = categoryId;
    }
    
    if (search) {
      whereConditions.name = Like(`%${search}%`);
    }
    
    if (minPrice && maxPrice) {
      whereConditions.price = Between(minPrice, maxPrice);
    } else if (minPrice) {
      whereConditions.price = MoreThanOrEqual(minPrice);
    } else if (maxPrice) {
      whereConditions.price = Between(0, maxPrice);
    }
    
    if (inStock === true) {
      whereConditions.quantity = MoreThanOrEqual(1);
    }
    
    // Execute query
    const [products, total] = await this.productsRepository.findAndCount({
      where: whereConditions,
      order: { [sortBy]: order },
      take,
      skip,
      relations: ['category'],
    });
    
    const totalPages = Math.ceil(total / take);
    
    return {
      data: products,
      meta: {
        total,
        page,
        limit: take,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findFeatured(): Promise<Product[]> {
    return this.productsRepository.find({
      where: {
        isFeatured: true,
        status: ProductStatus.ACTIVE,
      },
      take: 8,
      relations: ['category'],
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { categoryId, ...productData } = createProductDto;
    
    // Check if category exists
    const category = await this.categoriesRepository.findOne({
      where: { id: categoryId },
    });
    
    if (!category) {
      throw new BadRequestException(`Category with ID ${categoryId} not found`);
    }
    
    // Generate slug from name
    const slug = this.generateSlug(createProductDto.name);
    
    // Check if slug is unique
    const existingProduct = await this.productsRepository.findOne({
      where: { slug },
    });
    
    if (existingProduct) {
      throw new BadRequestException('Product with similar name already exists');
    }
    
    // Create product
    const product = this.productsRepository.create({
      ...productData,
      slug,
      categoryId,
    });
    
    const savedProduct = await this.productsRepository.save(product);
    
    // Clear cache
    await this.clearProductCache();
    
    return savedProduct;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    
    const { categoryId, ...updateData } = updateProductDto;
    
    // If category is being updated, check if it exists
    if (categoryId) {
      const category = await this.categoriesRepository.findOne({
        where: { id: categoryId },
      });
      
      if (!category) {
        throw new BadRequestException(`Category with ID ${categoryId} not found`);
      }
    }
    
    // If name is being updated, update slug
    if (updateProductDto.name) {
      const newSlug = this.generateSlug(updateProductDto.name);
      
      // Check if new slug is unique (excluding current product)
      const existingProduct = await this.productsRepository.findOne({
        where: { slug: newSlug },
      });
      
      if (existingProduct && existingProduct.id !== id) {
        throw new BadRequestException('Product with similar name already exists');
      }
      
      updateData.slug = newSlug;
    }
    
    // Update product
    const updatedProduct = await this.productsRepository.save({
      ...product,
      ...updateData,
      ...(categoryId ? { categoryId } : {}),
    });
    
    // Clear cache
    await this.clearProductCache();
    
    return updatedProduct;
  }

  async remove(id: number): Promise<{ message: string }> {
    const product = await this.findOne(id);
    
    // Soft delete by changing status to inactive
    product.status = ProductStatus.INACTIVE;
    await this.productsRepository.save(product);
    
    // Clear cache
    await this.clearProductCache();
    
    return { message: `Product with ID ${id} has been deactivated` };
  }
  
  async updateProductRating(productId: number): Promise<void> {
    const product = await this.findOne(productId);
    
    // Calculate new average rating
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .leftJoin('product.reviews', 'review')
      .select('AVG(review.rating)', 'avgRating')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .where('product.id = :id', { id: productId })
      .getRawOne();
    
    // Update product with new rating data
    product.avgRating = result.avgRating || 0;
    product.reviewCount = result.reviewCount || 0;
    
    await this.productsRepository.save(product);
    
    // Clear product cache
    await this.cacheManager.del(CACHE_KEYS.PRODUCT_DETAILS(productId));
  }

  private generateSlug(name: string): string {
    return slugify(name, {
      lower: true,
      strict: true,
      locale: 'vi',
    });
  }

  private async clearProductCache(): Promise<void> {
    await this.cacheManager.del(CACHE_KEYS.PRODUCTS);
    await this.cacheManager.del(CACHE_KEYS.FEATURED_PRODUCTS);
  }
}
