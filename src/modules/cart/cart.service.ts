import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartItemsRepository: Repository<CartItem>,
    private productsService: ProductsService,
  ) {}

  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<CartItem> {
    const { productId, quantity } = addToCartDto;
    
    // Check if product exists and is available
    const product = await this.productsService.findOne(productId);
    
    if (!product.isActive) {
      throw new BadRequestException('Product is not available');
    }
    
    if (product.stockQuantity < quantity) {
      throw new BadRequestException('Not enough stock available');
    }
    
    // Check if item already in cart
    let cartItem = await this.cartItemsRepository.findOne({
      where: { userId, productId },
      relations: ['product'],
    });
    
    if (cartItem) {
      // Update quantity if already in cart
      cartItem.quantity += quantity;
      
      // Check if updated quantity exceeds stock
      if (cartItem.quantity > product.stockQuantity) {
        throw new BadRequestException('Requested quantity exceeds available stock');
      }
      
      return this.cartItemsRepository.save(cartItem);
    }
    
    // Create new cart item
    cartItem = this.cartItemsRepository.create({
      userId,
      productId,
      quantity,
    });
    
    return this.cartItemsRepository.save(cartItem);
  }

  async getCart(userId: string): Promise<{ items: CartItem[]; total: number }> {
    const items = await this.cartItemsRepository.find({
      where: { userId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
    });
    
    // Calculate total
    const total = items.reduce((sum, item) => {
      const itemPrice = item.product.salePrice || item.product.price;
      return sum + (itemPrice * item.quantity);
    }, 0);
    
    return { items, total };
  }

  async updateCartItem(userId: string, itemId: string, updateCartItemDto: UpdateCartItemDto): Promise<CartItem> {
    const cartItem = await this.findCartItem(userId, itemId);
    
    // Check if requested quantity is available
    const product = await this.productsService.findOne(cartItem.productId);
    
    if (updateCartItemDto.quantity > product.stockQuantity) {
      throw new BadRequestException('Requested quantity exceeds available stock');
    }
    
    // Update the cart item
    cartItem.quantity = updateCartItemDto.quantity;
    
    return this.cartItemsRepository.save(cartItem);
  }

  async removeCartItem(userId: string, itemId: string): Promise<void> {
    const cartItem = await this.findCartItem(userId, itemId);
    
    await this.cartItemsRepository.remove(cartItem);
  }
  
  async clearCart(userId: string): Promise<void> {
    await this.cartItemsRepository.delete({ userId });
  }

  private async findCartItem(userId: string, itemId: string): Promise<CartItem> {
    const cartItem = await this.cartItemsRepository.findOne({
      where: { id: itemId, userId },
      relations: ['product'],
    });
    
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }
    
    return cartItem;
  }
}
