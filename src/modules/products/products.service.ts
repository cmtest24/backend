import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, FindManyOptions } from 'typeorm';
import { Cache } from 'cache-manager';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto, SortField, SortOrder } from './dto/query-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    const savedProduct = await this.productsRepository.save(product);
    
    // Clear cache after creating a new product
    await this.clearCache();
    
    return savedProduct;
  }

  async findAll(query: QueryProductDto): Promise<{ products: Product[]; total: number }> {
    const cacheKey = `products_${JSON.stringify(query)}`;
    
    // Try to get from cache first
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      return cachedResult as { products: Product[]; total: number };
    }
    
    const {
      search,
      slug, // Add slug here
      categoryId,
      minPrice,
      maxPrice,
      sortBy = SortField.CREATED_AT,
      sortOrder = SortOrder.DESC,
      page = 1,
      limit = 10
    } = query;
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    // Apply filters
    if (search) {
      where.name = Like(`%${search}%`);
    }
    
    if (slug) { // Add slug filter
      where.slug = slug;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (minPrice !== undefined && maxPrice !== undefined) {
      where.price = Between(minPrice, maxPrice);
    } else if (minPrice !== undefined) {
      where.price = Between(minPrice, 1000000); // Some high value
    } else if (maxPrice !== undefined) {
      where.price = Between(0, maxPrice);
    }
    
    const order: any = {};
    order[sortBy] = sortOrder;
    
    const [products, total] = await this.productsRepository.findAndCount({
      where,
      order,
      skip,
      take: limit,
      relations: ['category'],
    });
    
    const result = { products, total };
    
    // Cache the result
    await this.cacheManager.set(cacheKey, result, 600); // Cache for 10 minutes
    
    return result;
  }

  async findOne(id: string): Promise<Product> {
    const cacheKey = `product_${id}`;
    
    // Try to get from cache first
    const cachedProduct = await this.cacheManager.get<Product>(cacheKey);
    if (cachedProduct) {
      return cachedProduct;
    }
    
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['category', 'reviews', 'reviews.user'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    // Cache the result
    await this.cacheManager.set(cacheKey, product, 1800); // Cache for 30 minutes
    
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    
    // Update the product
    Object.assign(product, updateProductDto);
    
    const updatedProduct = await this.productsRepository.save(product);
    
    // Clear cache
    await this.clearCache();
    await this.cacheManager.del(`product_${id}`);
    
    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);

    await this.productsRepository.remove(product);
    
    // Clear cache
    await this.clearCache();
    await this.cacheManager.del(`product_${id}`);
  }
  
  private async clearCache(): Promise<void> {
    // Clear all products-related cache
    // This is a simplified approach - in production you might want to be more selective
    const store: any = (this.cacheManager as any).store;
    if (store && typeof store.keys === 'function') {
      const keys = await store.keys('products_*');
      await Promise.all(keys.map((key: string) => this.cacheManager.del(key)));
    }
    await this.cacheManager.del('featured_products');
  }
}
