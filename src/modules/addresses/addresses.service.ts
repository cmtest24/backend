import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

  async findAllByUser(userId: number): Promise<Address[]> {
    return this.addressesRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async create(createAddressDto: CreateAddressDto, userId: number): Promise<Address> {
    const { isDefault = false } = createAddressDto;

    // If this address should be default, unset any existing default
    if (isDefault) {
      await this.unsetDefaultAddresses(userId);
    }

    // If this is the first address for the user, make it default
    const addressCount = await this.addressesRepository.count({ where: { userId } });
    if (addressCount === 0) {
      createAddressDto.isDefault = true;
    }

    // Create new address
    const address = this.addressesRepository.create({
      ...createAddressDto,
      userId,
    });

    return this.addressesRepository.save(address);
  }

  async update(id: number, updateAddressDto: UpdateAddressDto, userId: number): Promise<Address> {
    const address = await this.findAddressByIdAndUser(id, userId);

    // If setting as default, unset other default addresses
    if (updateAddressDto.isDefault) {
      await this.unsetDefaultAddresses(userId);
    }

    // Update address
    const updatedAddress = await this.addressesRepository.save({
      ...address,
      ...updateAddressDto,
    });

    return updatedAddress;
  }

  async remove(id: number, userId: number): Promise<{ message: string }> {
    const address = await this.findAddressByIdAndUser(id, userId);
    
    await this.addressesRepository.remove(address);
    
    // If the deleted address was default, set another address as default if available
    if (address.isDefault) {
      const otherAddress = await this.addressesRepository.findOne({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
      
      if (otherAddress) {
        otherAddress.isDefault = true;
        await this.addressesRepository.save(otherAddress);
      }
    }
    
    return { message: 'Address deleted successfully' };
  }

  async setDefault(id: number, userId: number): Promise<Address> {
    const address = await this.findAddressByIdAndUser(id, userId);
    
    // Unset other default addresses
    await this.unsetDefaultAddresses(userId);
    
    // Set this address as default
    address.isDefault = true;
    return this.addressesRepository.save(address);
  }

  private async findAddressByIdAndUser(id: number, userId: number): Promise<Address> {
    const address = await this.addressesRepository.findOne({
      where: { id },
    });
    
    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }
    
    if (address.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this address');
    }
    
    return address;
  }

  private async unsetDefaultAddresses(userId: number): Promise<void> {
    await this.addressesRepository.update(
      { userId, isDefault: true },
      { isDefault: false }
    );
  }
}
