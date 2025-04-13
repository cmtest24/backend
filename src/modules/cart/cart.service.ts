import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ForbiddenException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductsService } from '../products/products.service';
import { ProductStatus } from '../products/entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    private productsService: ProductsService,
  ) {}

  async findAllByUser(userId: number) {
    const cartItems = await this.cartItemRepository.find({
      where: { userId },
      relations: ['product', 'product.category'],
      order: { createdAt: 'DESC' },
    });

    // Calculate cart summary
    let subtotal = 0;
    let totalItems = 0;

    cartItems.forEach(item => {
      subtotal += item.product.price * item.quantity;
      totalItems += item.quantity;
    });

    return {
      items: cartItems,
      summary: {
        subtotal,
        totalItems,
        itemCount: cartItems.length,
      },
    };
  }

  async addToCart(addToCartDto: AddToCartDto, userId: number): Promise<CartItem> {
    const { productId, quantity } = addToCartDto;

    // Check if product exists and is available
    const product = await this.productsService.findOne(productId);

    if (product.status !== ProductStatus.ACTIVE) {
      throw new BadRequestException('Product is not available');
    }

    if (product.quantity < quantity) {
      throw new BadRequestException('Not enough stock available');
    }

    // Check if product is already in cart
    let cartItem = await this.cartItemRepository.findOne({
      where: { userId, productId },
    });

    if (cartItem) {
      // Update existing cart item
      cartItem.quantity += quantity;
      
      // Check if new quantity exceeds available stock
      if (cartItem.quantity > product.quantity) {
        throw new BadRequestException('Not enough stock available');
      }
      
      return this.cartItemRepository.save(cartItem);
    } else {
      // Create new cart item
      cartItem = this.cartItemRepository.create({
        userId,
        productId,
        quantity,
      });
      
      return this.cartItemRepository.save(cartItem);
    }
  }

  async updateCartItem(
    itemId: number,
    updateCartItemDto: UpdateCartItemDto,
    userId: number,
  ): Promise<CartItem> {
    const { quantity } = updateCartItemDto;

    // Find cart item
    const cartItem = await this.findCartItemAndCheckOwnership(itemId, userId);

    // Check if product has enough stock
    const product = await this.productsService.findOne(cartItem.productId);
    
    if (product.status !== ProductStatus.ACTIVE) {
      throw new BadRequestException('Product is not available');
    }

    if (product.quantity < quantity) {
      throw new BadRequestException('Not enough stock available');
    }

    // Update cart item
    cartItem.quantity = quantity;
    return this.cartItemRepository.save(cartItem);
  }

  async removeFromCart(itemId: number, userId: number): Promise<{ message: string }> {
    const cartItem = await this.findCartItemAndCheckOwnership(itemId, userId);
    
    await this.cartItemRepository.remove(cartItem);
    
    return { message: 'Item removed from cart successfully' };
  }
  
  async clearCart(userId: number): Promise<void> {
    await this.cartItemRepository.delete({ userId });
  }

  private async findCartItemAndCheckOwnership(itemId: number, userId: number): Promise<CartItem> {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId },
    });
    
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }
    
    if (cartItem.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this cart item');
    }
    
    return cartItem;
  }
}
