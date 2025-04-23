import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreInfo } from './entities/store-info.entity';
import { CreateStoreInfoDto } from './dto/create-store-info.dto';
import { UpdateStoreInfoDto } from './dto/update-store-info.dto';

@Injectable()
export class StoreInfoService {
  constructor(
    @InjectRepository(StoreInfo)
    private storeInfoRepository: Repository<StoreInfo>,
  ) {}

  async create(createStoreInfoDto: CreateStoreInfoDto): Promise<StoreInfo> {
    const existingInfo = await this.storeInfoRepository.findOne({ where: {} });
    if (existingInfo) {
      throw new ConflictException('Store information already exists. Use update instead.');
    }

    const storeInfo = this.storeInfoRepository.create(createStoreInfoDto);
    return this.storeInfoRepository.save(storeInfo);
  }

  async findOne(): Promise<StoreInfo> {
    const storeInfo = await this.storeInfoRepository.findOne({ where: {} });
    if (!storeInfo) {
      throw new NotFoundException('Store information not found');
    }
    return storeInfo;
  }

  async update(updateStoreInfoDto: UpdateStoreInfoDto): Promise<StoreInfo> {
    const storeInfo = await this.storeInfoRepository.findOne({ where: {} });
    if (!storeInfo) {
      throw new NotFoundException('Store information not found');
    }

    Object.assign(storeInfo, updateStoreInfoDto);
    return this.storeInfoRepository.save(storeInfo);
  }

  async remove(): Promise<void> {
    const storeInfo = await this.storeInfoRepository.findOne({ where: {} });
    if (!storeInfo) {
      throw new NotFoundException('Store information not found');
    }

    await this.storeInfoRepository.remove(storeInfo);
  }
}