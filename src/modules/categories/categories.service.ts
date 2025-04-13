import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  Inject,
  CACHE_MANAGER
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import * as slugify from 'slugify';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Product, ProductStatus } from '../products/entities/product.entity';
import { CACHE_KEYS } from '../../common/constants';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({
      order: { name: 'ASC' },
      relations: ['children', 'parent'],
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['children', 'parent'],
    });
    
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    
    return category;
  }

  async getProductsByCategory(id: number) {
    const category = await this.findOne(id);
    
    // Get all subcategory IDs
    const categoryIds = [id];
    const getChildrenIds = async (parentId: number) => {
      const children = await this.categoriesRepository.find({
        where: { parentId },
        select: ['id'],
      });
      
      for (const child of children) {
        categoryIds.push(child.id);
        await getChildrenIds(child.id);
      }
    };
    
    await getChildrenIds(id);
    
    // Find products in current category and subcategories
    const products = await this.categoriesRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.products', 'product')
      .where('category.id IN (:...ids)', { ids: categoryIds })
      .andWhere('product.status = :status', { status: ProductStatus.ACTIVE })
      .orderBy('product.createdAt', 'DESC')
      .getMany();
    
    // Flatten products from all categories
    const allProducts = products.reduce(
      (acc, category) => [...acc, ...category.products],
      [],
    );
    
    return {
      category,
      products: allProducts,
    };
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name, parentId } = createCategoryDto;
    
    // Generate slug from name
    const slug = this.generateSlug(name);
    
    // Check if slug is unique
    const existingCategory = await this.categoriesRepository.findOne({
      where: { slug },
    });
    
    if (existingCategory) {
      throw new BadRequestException('Category with similar name already exists');
    }
    
    // If parentId is provided, check if parent category exists
    if (parentId) {
      const parentCategory = await this.categoriesRepository.findOne({
        where: { id: parentId },
      });
      
      if (!parentCategory) {
        throw new BadRequestException(`Parent category with ID ${parentId} not found`);
      }
    }
    
    // Create category
    const category = this.categoriesRepository.create({
      ...createCategoryDto,
      slug,
    });
    
    const savedCategory = await this.categoriesRepository.save(category);
    
    // Clear cache
    await this.clearCategoryCache();
    
    return savedCategory;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    
    // If name is being updated, update slug
    if (updateCategoryDto.name) {
      const newSlug = this.generateSlug(updateCategoryDto.name);
      
      // Check if new slug is unique (excluding current category)
      const existingCategory = await this.categoriesRepository.findOne({
        where: { slug: newSlug },
      });
      
      if (existingCategory && existingCategory.id !== id) {
        throw new BadRequestException('Category with similar name already exists');
      }
      
      updateCategoryDto.slug = newSlug;
    }
    
    // If parentId is being updated, check for circular reference
    if (updateCategoryDto.parentId) {
      // Category cannot be its own parent
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
      
      // Check if parentId exists
      const parentCategory = await this.categoriesRepository.findOne({
        where: { id: updateCategoryDto.parentId },
      });
      
      if (!parentCategory) {
        throw new BadRequestException(`Parent category with ID ${updateCategoryDto.parentId} not found`);
      }
      
      // Check for circular reference
      let currentParent = parentCategory;
      while (currentParent.parentId) {
        if (currentParent.parentId === id) {
          throw new BadRequestException('Circular reference detected in category hierarchy');
        }
        
        currentParent = await this.categoriesRepository.findOne({
          where: { id: currentParent.parentId },
        });
      }
    }
    
    // Update category
    const updatedCategory = await this.categoriesRepository.save({
      ...category,
      ...updateCategoryDto,
    });
    
    // Clear cache
    await this.clearCategoryCache();
    
    return updatedCategory;
  }

  async remove(id: number): Promise<{ message: string }> {
    const category = await this.findOne(id);
    
    // Check if category has children
    const childrenCount = await this.categoriesRepository.count({
      where: { parentId: id },
    });
    
    if (childrenCount > 0) {
      throw new BadRequestException('Cannot delete category with children. Delete or reassign children first.');
    }
    
    // Delete category
    await this.categoriesRepository.remove(category);
    
    // Clear cache
    await this.clearCategoryCache();
    
    return { message: `Category with ID ${id} has been deleted` };
  }

  private generateSlug(name: string): string {
    return slugify(name, {
      lower: true,
      strict: true,
      locale: 'vi',
    });
  }

  private async clearCategoryCache(): Promise<void> {
    await this.cacheManager.del(CACHE_KEYS.CATEGORIES);
  }
}
