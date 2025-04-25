import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Policy } from './policy.entity';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';

@Injectable()
export class PolicyService {
  constructor(
    @InjectRepository(Policy)
    private policyRepository: Repository<Policy>,
  ) {}

  async create(createPolicyDto: CreatePolicyDto): Promise<Policy> {
    // Check if slug already exists
    const existingPolicy = await this.policyRepository.findOne({
      where: { slug: createPolicyDto.slug },
    });

    if (existingPolicy) {
      throw new ConflictException('Policy with this slug already exists');
    }

    const policy = this.policyRepository.create(createPolicyDto);
    return this.policyRepository.save(policy);
  }

  async findAll(): Promise<Policy[]> {
    return this.policyRepository.find();
  }

  async findOne(id: number): Promise<Policy> {
    const policy = await this.policyRepository.findOne({ where: { id } });
    if (!policy) {
      throw new NotFoundException(`Policy with ID ${id} not found`);
    }
    return policy;
  }

  async findBySlug(slug: string): Promise<Policy> {
    const policy = await this.policyRepository.findOne({ where: { slug } });
    if (!policy) {
      throw new NotFoundException(`Policy with slug "${slug}" not found`);
    }
    return policy;
  }

  async update(id: number, updatePolicyDto: UpdatePolicyDto): Promise<Policy> {
    const policy = await this.findOne(id);

    // Check slug uniqueness if changing
    if (updatePolicyDto.slug && updatePolicyDto.slug !== policy.slug) {
      const existingPolicy = await this.policyRepository.findOne({
        where: { slug: updatePolicyDto.slug },
      });

      if (existingPolicy && existingPolicy.id !== id) {
        throw new ConflictException('Policy with this slug already exists');
      }
    }

    this.policyRepository.merge(policy, updatePolicyDto);
    return this.policyRepository.save(policy);
  }

  async remove(id: number): Promise<void> {
    const result = await this.policyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Policy with ID ${id} not found`);
    }
  }
}