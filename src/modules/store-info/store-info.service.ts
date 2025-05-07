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
    const storeInfo = await this.storeInfoRepository.findOne({
      where: {},
    });
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

  // Phương thức thêm địa chỉ cửa hàng
  async addAddress(address: { name: string; phoneNumber: string; address: string }): Promise<StoreInfo> {
    const storeInfo = await this.findOne();
    
    // Khởi tạo mảng addresses nếu chưa có
    if (!storeInfo.addresses) {
      storeInfo.addresses = [];
    }
    
    // Thêm địa chỉ mới vào mảng
    storeInfo.addresses.push(address);
    
    // Lưu thông tin cửa hàng với địa chỉ mới
    return this.storeInfoRepository.save(storeInfo);
  }

  // Phương thức cập nhật địa chỉ cửa hàng
  async updateAddress(index: number, address: { name: string; phoneNumber: string; address: string }): Promise<StoreInfo> {
    const storeInfo = await this.findOne();
    
    // Kiểm tra xem index có hợp lệ không
    if (!storeInfo.addresses || index < 0 || index >= storeInfo.addresses.length) {
      throw new NotFoundException(`Address at index ${index} not found`);
    }
    
    // Cập nhật địa chỉ tại vị trí index
    storeInfo.addresses[index] = address;
    
    // Lưu thông tin cửa hàng với địa chỉ đã cập nhật
    return this.storeInfoRepository.save(storeInfo);
  }

  // Phương thức xóa địa chỉ cửa hàng
  async removeAddress(index: number): Promise<StoreInfo> {
    const storeInfo = await this.findOne();
    
    // Kiểm tra xem index có hợp lệ không
    if (!storeInfo.addresses || index < 0 || index >= storeInfo.addresses.length) {
      throw new NotFoundException(`Address at index ${index} not found`);
    }
    
    // Xóa địa chỉ tại vị trí index
    storeInfo.addresses.splice(index, 1);
    
    // Lưu thông tin cửa hàng sau khi xóa địa chỉ
    return this.storeInfoRepository.save(storeInfo);
  }
}