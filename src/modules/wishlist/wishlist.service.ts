import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
  ) {}

  async create(userId: string, createWishlistDto: CreateWishlistDto): Promise<Wishlist> {
    try {
      // Check if product already in wishlist
      const existing = await this.wishlistRepository.findOne({
        where: {
          userId,
          productId: createWishlistDto.productId,
        },
      });

      if (existing) {
        throw new ConflictException('Product already in wishlist');
      }

      const wishlistItem = this.wishlistRepository.create({
        userId,
        productId: createWishlistDto.productId,
      });

      return this.wishlistRepository.save(wishlistItem);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw error;
    }
  }

  async findAllByUser(userId: string): Promise<Wishlist[]> {
    return this.wishlistRepository.find({
      where: { userId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
  }

  async remove(userId: string, productId: string): Promise<void> {
    const wishlistItem = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });

    if (!wishlistItem) {
      throw new NotFoundException('Product not found in wishlist');
    }

    await this.wishlistRepository.remove(wishlistItem);
  }
}
