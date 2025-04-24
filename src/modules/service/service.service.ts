import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Category } from '../categories/entities/category.entity'; // Import Category entity

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Category) // Inject Category repository
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const { categoryId, ...serviceDetails } = createServiceDto;

    const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundException(`Category with ID "${categoryId}" not found`);
    }

    const service = this.serviceRepository.create({
      ...serviceDetails,
      category: category, // Assign the Category entity
    });

    return this.serviceRepository.save(service);
  }

  async findAll(limit: number, offset: number, categoryId?: string): Promise<Service[]> {
    const findOptions: any = {
      relations: ['category'], // Eager load category
      take: limit,
      skip: offset,
    };

    if (categoryId) {
      findOptions.where = { category: { id: categoryId } };
    }

    const services = await this.serviceRepository.find(findOptions);

    // Prepend base URL and public path to image
    return services.map(service => ({
      ...service,
      image: `${process.env.DOMAIN}${service.image}`,
    }));
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({ where: { id }, relations: ['category'] }); // Eager load category
    if (!service) {
      throw new NotFoundException(`Service with ID "${id}" not found`);
    }

    // Prepend base URL and public path to image
    return {
      ...service,
      image: `${process.env.DOMAIN}/public/${service.image}`,
    };
  }

  async findByCategoryId(categoryId: string, limit: number, offset: number): Promise<Service[]> {
    const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundException(`Category with ID "${categoryId}" not found`);
    }
    return this.serviceRepository.find({
      where: { category: { id: categoryId } },
      relations: ['category'],
      take: limit,
      skip: offset,
    });
  }

  async update(id: string, updateServiceDto: UpdateServiceDto): Promise<Service> {
    const service = await this.findOne(id);
    const { categoryId, ...updateDetails } = updateServiceDto;

    if (categoryId !== undefined) { // Check if categoryId is provided in the DTO
      if (categoryId === null) { // Handle case where category should be removed
        service.category = null;
      } else {
        const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
        if (!category) {
          throw new NotFoundException(`Category with ID "${categoryId}" not found`);
        }
        service.category = category; // Update the Category entity
      }
    }

    this.serviceRepository.merge(service, updateDetails); // Merge other details
    return this.serviceRepository.save(service);
  }

  async remove(id: string): Promise<void> {
    const result = await this.serviceRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Service with ID "${id}" not found`);
    }
  }
}