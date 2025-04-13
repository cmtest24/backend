import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private addressesRepository: Repository<Address>,
  ) {}

  async create(userId: string, createAddressDto: CreateAddressDto): Promise<Address> {
    // If setting as default, reset existing default addresses
    if (createAddressDto.isDefault) {
      await this.resetDefaultAddresses(userId);
    }

    const address = this.addressesRepository.create({
      ...createAddressDto,
      userId,
    });

    return this.addressesRepository.save(address);
  }

  async findAllByUser(userId: string): Promise<Address[]> {
    return this.addressesRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Address> {
    const address = await this.addressesRepository.findOne({
      where: { id, userId },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    return address;
  }

  async update(id: string, userId: string, updateAddressDto: UpdateAddressDto): Promise<Address> {
    const address = await this.findOne(id, userId);

    // If setting as default, reset existing default addresses
    if (updateAddressDto.isDefault) {
      await this.resetDefaultAddresses(userId);
    }

    // Update the address
    Object.assign(address, updateAddressDto);

    return this.addressesRepository.save(address);
  }

  async remove(id: string, userId: string): Promise<void> {
    const address = await this.findOne(id, userId);

    await this.addressesRepository.remove(address);
  }

  async setDefault(id: string, userId: string): Promise<Address> {
    const address = await this.findOne(id, userId);

    // Reset existing default addresses
    await this.resetDefaultAddresses(userId);

    // Set this address as default
    address.isDefault = true;

    return this.addressesRepository.save(address);
  }

  private async resetDefaultAddresses(userId: string): Promise<void> {
    await this.addressesRepository
      .createQueryBuilder()
      .update(Address)
      .set({ isDefault: false })
      .where('userId = :userId', { userId })
      .execute();
  }
}
