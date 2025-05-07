import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ConflictException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateGuestOrderDto } from './dto/create-guest-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { PromotionsService } from '../promotions/promotions.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    private dataSource: DataSource,
    private cartService: CartService,
    private productsService: ProductsService,
    private promotionsService: PromotionsService,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      let orderItems: OrderItem[] = [];
      let subtotal = 0;
      let discount = 0;
      
      // Check for promotion code
      if (createOrderDto.promotionCode) {
        const promotion = await this.promotionsService.validatePromotion(
          createOrderDto.promotionCode,
        );
        
        if (promotion) {
          discount = promotion.amount;
        }
      }
      
      if (createOrderDto.useCartItems) {
        // Use items from cart
        const cart = await this.cartService.getCart(userId);
        
        if (cart.items.length === 0) {
          throw new BadRequestException('Cart is empty');
        }
        
        // Check stock availability for all items
        for (const cartItem of cart.items) {
          const product = await this.productsService.findOne(cartItem.productId);
          
          // Prepare order items
          const price = product.salePrice || product.price;
          const orderItem = this.orderItemsRepository.create({
            productId: product.id,
            productName: product.name,
            price: price,
            quantity: cartItem.quantity,
            subtotal: price * cartItem.quantity,
          });
          
          orderItems.push(orderItem);
          subtotal += orderItem.subtotal;
          
        }
        
        // Clear the cart after creating order
        await this.cartService.clearCart(userId);
      } else if (createOrderDto.items && createOrderDto.items.length > 0) {
        // Use provided items
        for (const item of createOrderDto.items) {
          const product = await this.productsService.findOne(item.productId);
          
          const price = product.salePrice || product.price;
          const orderItem = this.orderItemsRepository.create({
            productId: product.id,
            productName: product.name,
            price: price,
            quantity: item.quantity,
            subtotal: price * item.quantity,
          });
          
          orderItems.push(orderItem);
          subtotal += orderItem.subtotal;
          
        }
      } else {
        throw new BadRequestException('No items specified for order');
      }
      
      // Calculate total with shipping and discount
      const shippingFee = this.calculateShippingFee(subtotal);
      const total = subtotal + shippingFee - discount;
      
      // Create the order
      const order = this.ordersRepository.create({
        userId,
        status: OrderStatus.PENDING,
        subtotal,
        shippingFee,
        discount,
        total,
        promotionCode: createOrderDto.promotionCode,
        note: createOrderDto.note,
        shippingFullName: createOrderDto.shippingFullName,
        shippingPhone: createOrderDto.shippingPhone,
        shippingAddress: createOrderDto.shippingAddress,
        shippingWard: createOrderDto.shippingWard,
        shippingDistrict: createOrderDto.shippingDistrict,
        shippingCity: createOrderDto.shippingCity,
        shippingZipCode: createOrderDto.shippingZipCode,
      });
      
      const savedOrder = await this.ordersRepository.save(order);
      
      // Save order items and link to order
      for (const orderItem of orderItems) {
        orderItem.orderId = savedOrder.id;
        await this.orderItemsRepository.save(orderItem);
      }
      
      await queryRunner.commitTransaction();
      
      return this.findOne(userId, savedOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllByUser(userId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(userId: string, id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id, userId },
      relations: ['items', 'items.product', 'payments'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async cancelOrder(userId: string, id: string, reason?: string): Promise<Order> {
    const order = await this.findOne(userId, id);
    
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be cancelled');
    }
    
    // Update order status
    order.status = OrderStatus.CANCELLED;
    order.cancelReason = reason || 'Cancelled by user';
    
    return this.ordersRepository.save(order);
  }
  
  async cancelOrderNoAuth(id: string, reason?: string): Promise<Order> {
    const order = await this.findOneAdmin(id);
    
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be cancelled');
    }
    
    // Update order status
    order.status = OrderStatus.CANCELLED;
    order.cancelReason = reason || 'Cancelled by user';
    
    return this.ordersRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ['user', 'items'],
      order: { createdAt: 'DESC' },
    });
  }
  
  async createGuestOrder(createGuestOrderDto: CreateGuestOrderDto): Promise<Order> {
    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      let orderItems: OrderItem[] = [];
      let subtotal = 0;
      
      // Process order items
      for (const item of createGuestOrderDto.items) {
        const product = await this.productsService.findOne(item.productId);
        
        // Ưu tiên sử dụng giá khuyến mãi nếu có, nếu không thì sử dụng giá gốc
        const price = product.salePrice !== null && product.salePrice !== undefined ? product.salePrice : product.price;
        
        // Tính tổng tiền cho mỗi mục đơn hàng bằng cách nhân giá với số lượng
        const itemSubtotal = price * item.quantity;
        
        const orderItem = this.orderItemsRepository.create({
          productId: product.id,
          productName: product.name,
          price: price,
          quantity: item.quantity,
          subtotal: itemSubtotal,
        });
        
        orderItems.push(orderItem);
        subtotal += itemSubtotal; // Cộng vào tổng tiền đơn hàng
      }
      
      // Không tính phí ship, chỉ tính tổng giá sản phẩm
      const shippingFee = 0;
      const total = subtotal;
      
      // Create the order
      const order = this.ordersRepository.create({
        isGuestOrder: true,
        guestFullName: createGuestOrderDto.fullName,
        guestPhoneNumber: createGuestOrderDto.phoneNumber,
        guestEmail: '',
        note: createGuestOrderDto.note,
        status: OrderStatus.PENDING,
        subtotal,
        shippingFee,
        discount: 0,
        total,
        shippingFullName: createGuestOrderDto.fullName,
        shippingPhone: createGuestOrderDto.phoneNumber,
        shippingAddress: createGuestOrderDto.address,
        shippingWard: '',
        shippingDistrict: '',
        shippingCity: '',
        shippingZipCode: '',
      });
      
      const savedOrder = await this.ordersRepository.save(order);
      
      // Save order items and link to order
      for (const orderItem of orderItems) {
        orderItem.orderId = savedOrder.id;
        await this.orderItemsRepository.save(orderItem);
      }
      
      await queryRunner.commitTransaction();
      
      return this.findOneGuest(savedOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  
  async findOneGuest(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id, isGuestOrder: true },
      relations: ['items', 'items.product', 'payments'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }
  
  async findAllGuestOrders(phoneNumber: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { guestPhoneNumber: phoneNumber, isGuestOrder: true },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneAdmin(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product', 'payments'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOneAdmin(id);
    
    // If changing to cancelled, restore product stock
    if (
      updateStatusDto.status === OrderStatus.CANCELLED && 
      order.status !== OrderStatus.CANCELLED
    ) {
      order.cancelReason = updateStatusDto.cancelReason || 'Cancelled by admin';
    }
    
    // Update tracking number if provided
    if (updateStatusDto.trackingNumber) {
      order.trackingNumber = updateStatusDto.trackingNumber;
    }
    
    // Update status
    order.status = updateStatusDto.status;
    
    return this.ordersRepository.save(order);
  }
  
  async deleteOrder(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      const order = await this.findOneAdmin(id);
      
      // Delete order items first
      await this.orderItemsRepository.delete({ orderId: id });
      
      // Then delete the order
      await this.ordersRepository.delete(id);
      
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  
  private calculateShippingFee(subtotal: number): number {
    // Simple shipping fee calculation
    if (subtotal >= 500000) {
      return 0; // Free shipping for orders above 500,000 VND
    }
    
    return 30000; // Fixed shipping fee of 30,000 VND
  }
}
