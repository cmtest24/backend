import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from './faq.entity';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq)
    private faqRepository: Repository<Faq>,
  ) {}

  async create(createFaqDto: CreateFaqDto): Promise<Faq> {
    // Check if slug already exists
    const existingFaq = await this.faqRepository.findOne({
      where: { slug: createFaqDto.slug },
    });

    if (existingFaq) {
      throw new ConflictException('FAQ with this slug already exists');
    }

    const faq = this.faqRepository.create(createFaqDto);
    return this.faqRepository.save(faq);
  }

  async findAll(): Promise<Faq[]> {
    return this.faqRepository.find();
  }

  async findOne(id: number): Promise<Faq> {
    const faq = await this.faqRepository.findOne({ where: { id } });
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    return faq;
  }

  async findBySlug(slug: string): Promise<Faq> {
    const faq = await this.faqRepository.findOne({ where: { slug } });
    if (!faq) {
      throw new NotFoundException(`FAQ with slug "${slug}" not found`);
    }
    return faq;
  }

  async update(id: number, updateFaqDto: UpdateFaqDto): Promise<Faq> {
    const faq = await this.findOne(id);

    // Check slug uniqueness if changing
    if (updateFaqDto.slug && updateFaqDto.slug !== faq.slug) {
      const existingFaq = await this.faqRepository.findOne({
        where: { slug: updateFaqDto.slug },
      });

      if (existingFaq && existingFaq.id !== id) {
        throw new ConflictException('FAQ with this slug already exists');
      }
    }

    this.faqRepository.merge(faq, updateFaqDto);
    return this.faqRepository.save(faq);
  }

  async remove(id: number): Promise<void> {
    const result = await this.faqRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
  }
}