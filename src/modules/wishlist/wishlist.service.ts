import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ConflictException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    private productsService: ProductsService,
  ) {}

  async findAllByUser(userId: number): Promise<Wishlist[]> {
    return this.wishlistRepository.find({
      where: { userId },
      relations: ['product', 'product.category'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(addToWishlistDto: AddToWishlistDto, userId: number): Promise<Wishlist> {
    const { productId } = addToWishlistDto;
    
    // Check if product exists
    try {
      await this.productsService.findOne(productId);
    } catch (error) {
      throw new BadRequestException(`Product with ID ${productId} not found`);
    }
    
    // Check if product is already in wishlist
    const existingItem = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });
    
    if (existingItem) {
      throw new ConflictException('Product is already in wishlist');
    }
    
    // Add to wishlist
    const wishlistItem = this.wishlistRepository.create({
      userId,
      productId,
    });
    
    return this.wishlistRepository.save(wishlistItem);
  }

  async remove(productId: number, userId: number): Promise<{ message: string }> {
    const wishlistItem = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });
    
    if (!wishlistItem) {
      throw new NotFoundException('Wishlist item not found');
    }
    
    await this.wishlistRepository.remove(wishlistItem);
    
    return { message: 'Product removed from wishlist successfully' };
  }
}
