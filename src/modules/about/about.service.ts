import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { About } from './entities/about.entity';
import { CreateAboutDto } from './dto/create-about.dto';
import { UpdateAboutDto } from './dto/update-about.dto';

@Injectable()
export class AboutService {
  constructor(
    @InjectRepository(About)
    private aboutRepository: Repository<About>,
  ) {}

  async create(createAboutDto: CreateAboutDto): Promise<About> {
    const about = this.aboutRepository.create(createAboutDto);
    return this.aboutRepository.save(about);
  }

  async findAll(): Promise<About[]> {
    return this.aboutRepository.find();
  }

  async findOne(id: number): Promise<About> {
    const about = await this.aboutRepository.findOne({ where: { id } });
    if (!about) {
      throw new NotFoundException(`About with ID ${id} not found`);
    }
    return about;
  }

  async update(id: number, updateAboutDto: UpdateAboutDto): Promise<About> {
    const about = await this.findOne(id);
    this.aboutRepository.merge(about, updateAboutDto);
    return this.aboutRepository.save(about);
  }

  async remove(id: number): Promise<void> {
    const result = await this.aboutRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`About with ID ${id} not found`);
    }
  }
}