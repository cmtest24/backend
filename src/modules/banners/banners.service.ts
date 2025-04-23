import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private bannersRepository: Repository<Banner>,
  ) {}

  async create(createBannerDto: CreateBannerDto): Promise<Banner> {
    const banner = this.bannersRepository.create(createBannerDto);
    return this.bannersRepository.save(banner);
  }

  async findAll(): Promise<Banner[]> {
    return this.bannersRepository.find({ order: { order: 'ASC' } });
  }

  async findOne(id: number): Promise<Banner> {
    return this.bannersRepository.findOne({ where: { id } });
  }

  async update(id: number, updateBannerDto: CreateBannerDto): Promise<Banner> {
    await this.bannersRepository.update(id, updateBannerDto);
    return this.bannersRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.bannersRepository.delete(id);
  }
}