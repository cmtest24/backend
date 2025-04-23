import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { Category } from './entities/category.entity';
import { CategoryType } from './enums/category-type.enum';
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
    const { ...rest } = createCategoryDto;
    try {
      // Check if category with name, type and level already exists
      const existingCategory = await this.categoriesRepository.findOne({
        where: {
          name: rest.name,
          type: rest.type,
          level: rest.level,
        },
      });

      if (existingCategory) {
        throw new ConflictException(`Category with name "${rest.name}", type "${rest.type}" and level "${rest.level}" already exists.`);
      }

      const category = this.categoriesRepository.create(rest);

      const savedCategory = await this.categoriesRepository.save(category);

      // Clear cache after creating a new category
      await this.clearCache();

      return savedCategory;
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }

  async findAll(type?: CategoryType | string): Promise<Category[]> {
    let categoryType: CategoryType | undefined;
    if (type) {
      if (Object.values(CategoryType).includes(type as CategoryType)) {
        categoryType = type as CategoryType;
      } else {
        throw new NotFoundException(`Invalid category type: ${type}`);
      }
    }

    const cacheKey = categoryType ? `categories_${categoryType}` : 'categories_all';
    // Try to get from cache first
    const cachedCategories = await this.cacheManager.get<Category[]>(cacheKey);
    if (cachedCategories) {
      return cachedCategories;
    }

    // If not in cache, get from DB and cache the result
    const queryBuilder = this.categoriesRepository.createQueryBuilder('category');

    if (type) {
      queryBuilder.where('category.type = :type', { type });
    }

    queryBuilder.orderBy('category.level', 'ASC').addOrderBy('category.sortOrder', 'ASC');

    const categories = await queryBuilder.getMany();

    await this.cacheManager.set(cacheKey, categories, 3600); // Cache for 1 hour

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
    
    await this.cacheManager.set(cacheKey, category, 3600); // Cache for 1 hour
    
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    const { ...rest } = updateCategoryDto;

    // Check for name, type and level uniqueness if they are being updated
    if (
      (rest.name && rest.name !== category.name) ||
      (rest.type && rest.type !== category.type) ||
      (rest.level !== undefined && rest.level !== category.level)
    ) {
      const existingCategory = await this.categoriesRepository.findOne({
        where: {
          name: rest.name || category.name,
          type: rest.type || category.type,
          level: rest.level !== undefined ? rest.level : category.level,
        },
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException(`Category with name "${rest.name || category.name}", type "${rest.type || category.type}" and level "${rest.level !== undefined ? rest.level : category.level}" already exists.`);
      }
    }

    // Update the category properties
    Object.assign(category, rest);

    const updatedCategory = await this.categoriesRepository.save(category);

    // Clear cache after updating
    await this.clearCache(updatedCategory.type);
    await this.cacheManager.del(`category_${id}`);

    return updatedCategory;
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    const categoryType = category.type; // Store type before removing

    await this.categoriesRepository.remove(category);

    // Clear cache after deleting
    await this.clearCache(categoryType);
    await this.cacheManager.del(`category_${id}`);
  }

  private async clearCache(type?: CategoryType): Promise<void> {
    // Clear the general cache
    await this.cacheManager.del('categories_all');
    // If a specific type was modified, clear its cache as well
    if (type) {
      await this.cacheManager.del(`categories_${type}`);
    }
  }
}
