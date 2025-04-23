import { Injectable, NotFoundException, ConflictException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Cache } from 'cache-manager';
import { Category } from './entities/category.entity';
import { CategoryType } from './enums/category-type.enum';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: TreeRepository<Category>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { parentId, ...rest } = createCategoryDto;
    try {
      // Check if category with name and type already exists at the same level
      const existingCategory = await this.categoriesRepository.findOne({
        where: {
          name: rest.name,
          type: rest.type,
          parent: parentId ? { id: parentId } : null,
        },
      });

      if (existingCategory) {
        throw new ConflictException(`Category with name "${rest.name}" and type "${rest.type}" already exists under this parent.`);
      }

      const category = this.categoriesRepository.create(rest);

      if (parentId) {
        const parentCategory = await this.categoriesRepository.findOne({ where: { id: parentId } });
        if (!parentCategory) {
          throw new NotFoundException(`Parent category with ID ${parentId} not found`);
        }
        category.parent = parentCategory;
      }

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

  async findAll(type?: CategoryType): Promise<Category[]> {
    const cacheKey = type ? `categories_tree_${type}` : 'categories_tree_all';
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

    queryBuilder.orderBy('category.sortOrder', 'ASC');

    const categories = await this.categoriesRepository.findTrees(); // findTrees() fetches all and builds the tree

    // Filter the top-level categories by type if specified
    const filteredCategories = type ? categories.filter(cat => cat.type === type) : categories;

    await this.cacheManager.set(cacheKey, filteredCategories, 3600); // Cache for 1 hour

    return filteredCategories;
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
    const { parentId, ...rest } = updateCategoryDto;

    // Check for name uniqueness if name or type is being updated or parent is changed
    if (
      (rest.name && rest.name !== category.name) ||
      (rest.type && rest.type !== category.type) ||
      (parentId !== undefined && (parentId !== (category.parent?.id || null)))
    ) {
      const existingCategory = await this.categoriesRepository.findOne({
        where: {
          name: rest.name || category.name,
          type: rest.type || category.type,
          parent: parentId !== undefined ? (parentId ? { id: parentId } : null) : category.parent,
        },
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException(`Category with name "${rest.name || category.name}" and type "${rest.type || category.type}" already exists under this parent.`);
      }
    }

    // Update the category properties
    Object.assign(category, rest);

    // Update parent if parentId is provided
    if (parentId !== undefined) {
      if (parentId === null) {
        category.parent = null;
      } else {
        const parentCategory = await this.categoriesRepository.findOne({ where: { id: parentId } });
        if (!parentCategory) {
          throw new NotFoundException(`Parent category with ID ${parentId} not found`);
        }
        category.parent = parentCategory;
      }
    }

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
    await this.cacheManager.del('categories_tree_all');
    // If a specific type was modified, clear its cache as well
    if (type) {
      await this.cacheManager.del(`categories_tree_${type}`);
    }
  }
}
