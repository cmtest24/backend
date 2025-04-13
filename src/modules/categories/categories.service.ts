import { Injectable, NotFoundException, ConflictException, Inject, CACHE_MANAGER } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      // Check if category with name already exists
      const existingCategory = await this.categoriesRepository.findOne({
        where: { name: createCategoryDto.name },
      });

      if (existingCategory) {
        throw new ConflictException('Category with this name already exists');
      }

      const category = this.categoriesRepository.create(createCategoryDto);
      const savedCategory = await this.categoriesRepository.save(category);
      
      // Clear cache after creating a new category
      await this.clearCache();
      
      return savedCategory;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw error;
    }
  }

  async findAll(): Promise<Category[]> {
    // Try to get from cache first
    const cachedCategories = await this.cacheManager.get<Category[]>('all_categories');
    if (cachedCategories) {
      return cachedCategories;
    }
    
    // If not in cache, get from DB and cache the result
    const categories = await this.categoriesRepository.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
    
    await this.cacheManager.set('all_categories', categories, { ttl: 3600 }); // Cache for 1 hour
    
    return categories;
  }

  async findOne(id: string): Promise<Category> {
    // Try to get from cache first
    const cacheKey = `category_${id}`;
    const cachedCategory = await this.cacheManager.get<Category>(cacheKey);
    if (cachedCategory) {
      return cachedCategory;
    }
    
    // If not in cache, get from DB and cache the result
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    
    await this.cacheManager.set(cacheKey, category, { ttl: 3600 }); // Cache for 1 hour
    
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    // Check for name uniqueness if name is being updated
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoriesRepository.findOne({
        where: { name: updateCategoryDto.name },
      });

      if (existingCategory) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    // Update the category
    Object.assign(category, updateCategoryDto);
    
    const updatedCategory = await this.categoriesRepository.save(category);
    
    // Clear cache after updating
    await this.clearCache();
    await this.cacheManager.del(`category_${id}`);
    
    return updatedCategory;
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    await this.categoriesRepository.remove(category);
    
    // Clear cache after deleting
    await this.clearCache();
    await this.cacheManager.del(`category_${id}`);
  }
  
  private async clearCache(): Promise<void> {
    await this.cacheManager.del('all_categories');
  }
}
