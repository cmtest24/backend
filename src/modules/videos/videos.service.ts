import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Video } from './entities/video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { QueryVideoDto } from './dto/query-video.dto';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private videosRepository: Repository<Video>,
  ) {}

  async create(createVideoDto: CreateVideoDto): Promise<Video> {
    const video = this.videosRepository.create(createVideoDto);
    return this.videosRepository.save(video);
  }

  async findAll(query: QueryVideoDto): Promise<{ videos: Video[]; total: number }> {
    const { search, sortBy, sortOrder, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.tieuDe = Like(`%${search}%`);
    }

    const order: any = {};
    order[sortBy] = sortOrder;

    const [videos, total] = await this.videosRepository.findAndCount({
      where,
      order,
      skip,
      take: limit,
    });

    return { videos, total };
  }

  async findOne(id: string): Promise<Video> {
    const video = await this.videosRepository.findOne({ where: { id } });
    if (!video) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }
    return video;
  }

  async update(id: string, updateVideoDto: UpdateVideoDto): Promise<Video> {
    const video = await this.findOne(id);
    Object.assign(video, updateVideoDto);
    return this.videosRepository.save(video);
  }

  async remove(id: string): Promise<void> {
    const video = await this.findOne(id);
    await this.videosRepository.remove(video);
  }
}