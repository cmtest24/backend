import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreInfo } from './entities/store-info.entity';
import { StoreInfoDto } from './dto/store-info.dto';

@Injectable()
export class StoreInfoService {
  constructor(
    @InjectRepository(StoreInfo)
    private storeInfoRepository: Repository<StoreInfo>,
  ) {}

  async getStoreInfo(): Promise<StoreInfoDto> {
    // Assuming there's only one row for store info, or we take the first one
    const storeInfo = await this.storeInfoRepository.findOne({ where: {} });

    if (!storeInfo) {
      // Return default or throw error if info is not found
      throw new NotFoundException('Store information not found');
    }

    // Map entity to DTO
    const storeInfoDto: StoreInfoDto = {
      logo: storeInfo.logo,
      favicon: storeInfo.favicon,
      facebook: storeInfo.facebook,
      youtube: storeInfo.youtube,
      googleMap: storeInfo.googleMap,
      hotline: storeInfo.hotline,
      zalo: storeInfo.zalo,
      workingHours: storeInfo.workingHours,
    };

    return storeInfoDto;
  }

  // You might want to add methods for admin to update store info later
}