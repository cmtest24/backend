import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ForbiddenException,
  Inject,
  CACHE_MANAGER
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Cache } from 'cache-manager';
import { Order, OrderStatus, PaymentMethod } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ProductsService } from '../products/products.service';
import { CartService } from '../cart/cart.service';
import { AddressesService } from '../addresses/addresses.service';
import { PromotionsService } from '../promotions/promotions.service';
import { PaymentsService } from '../payments/payments.service';
import { PaginationOptions, PaginatedResult } from '../../common/interfaces/pagination.interface';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../../common/constants';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    private productsService: ProductsService,
    private cartService: CartService,
    private addressesService: AddressesService,
    private promotionsService: PromotionsService,
    private paymentsService: PaymentsService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async findAll(
    options: PaginationOptions, 
    status?: string,
    search?: string
  ): Promise<PaginatedResult<Order>> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const sortBy = options.sortBy || 'createdAt';
    const order = options.order || 'DESC';
    
    // Build query conditions
    const whereConditions: any = {};
    
    if (status) {
      whereConditions.status = status;
    }
    
    if (search) {
      whereConditions.orderNumber = Like(`%${search}%`);
    }
    
    const [orders, total] = await this.ordersRepository.findAndCount({
      where: whereConditions,
      order: { [sortBy]: order },
      take: limit,
      skip: (page - 1) * limit,
      relations: ['items', 'items.product', 'user', 'payments'],
    });
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findAllByUser(
    userId: number, 
    options: PaginationOptions,
    status?: string
  ): Promise<PaginatedResult<Order>> {
    const page = options.page || 1;
    const limit = Math.min(options.limit || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const sortBy = options.sortBy || 'createdAt';
    const order = options.order || 'DESC';
    
    // Build query conditions
    const whereConditions: any = { userId };
    
    if (status) {
      whereConditions.status = status;
    }
    
    const [orders, total] = await this.ordersRepository.findAndCount({
      where: whereConditions,
      order: { [sortBy]: order },
      take: limit,
      skip: (page - 1) * limit,
      relations: ['items', 'items.product', 'payments'],
    });
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'user', 'payments'],
    });
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    
    return order;
  }

  async findOneByUser(id: number, userId: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id, userId },
      relations: ['items', 'items.product', 'payments'],
    });
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    
    return order;
  }

  async create(createOrderDto: CreateOrderDto, userId: number): Promise<Order> {
    const { 
      addressId, 
      promotionCode, 
      useCart, 
      items: orderItems,
      paymentMethod, 
      ...orderData 
    } = createOrderDto;
    
    // If using saved address
    if (addressId) {
      const address = await this.addressesService.findAddressByIdAndUser(addressId, userId);
      
      orderData.customerName = orderData.customerName || address.fullName;
      orderData.customerPhone = orderData.customerPhone || address.phone;
      orderData.shippingAddress = orderData.shippingAddress || address.addressLine1;
      if (address.addressLine2) orderData.shippingAddress += `, ${address.addressLine2}`;
      orderData.shippingCity = orderData.shippingCity || address.city;
      orderData.shippingDistrict = orderData.shippingDistrict || address.district;
      orderData.shippingWard = orderData.shippingWard || address.ward;
    }
    
    // Generate order number
    const orderNumber = this.generateOrderNumber();
    
    // Initialize order
    const order = this.ordersRepository.create({
      orderNumber,
      userId,
      paymentMethod: paymentMethod || PaymentMethod.COD,
      totalAmount: 0, // Will calculate later
      ...orderData,
    });
    
    // Apply promotion if provided
    let discount = 0;
    if (promotionCode) {
      const promotion = await this.promotionsService.validatePromotion(promotionCode);
      if (promotion) {
        order.promotionCode = promotionCode;
        discount = promotion.discountAmount;
        order.discount = discount;
      }
    }
    
    // Process items
    const items: OrderItem[] = [];
    let subtotal = 0;
    
    // If using cart, convert cart items to order items
    if (useCart) {
      const cart = await this.cartService.findAllByUser(userId);
      
      if (!cart.items.length) {
        throw new BadRequestException('Cart is empty');
      }
      
      for (const cartItem of cart.items) {
        // Verify product availability and stock
        const product = await this.productsService.findOne(cartItem.productId);
        
        if (product.quantity < cartItem.quantity) {
          throw new BadRequestException(`Not enough stock for product: ${product.name}`);
        }
        
        // Create order item
        const orderItem = this.orderItemsRepository.create({
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: cartItem.quantity,
          subtotal: product.price * cartItem.quantity,
          sku: product.sku,
          attributes: product.attributes,
        });
        
        items.push(orderItem);
        subtotal += orderItem.subtotal;
        
        // Update product stock
        await this.productsService.update(product.id, {
          quantity: product.quantity - cartItem.quantity,
        });
      }
      
      // Clear cart after order creation
      await this.cartService.clearCart(userId);
      
    } else if (orderItems && orderItems.length) {
      // Process provided order items
      for (const item of orderItems) {
        // Verify product availability and stock
        const product = await this.productsService.findOne(item.productId);
        
        if (product.quantity < item.quantity) {
          throw new BadRequestException(`Not enough stock for product: ${product.name}`);
        }
        
        // Create order item
        const orderItem = this.orderItemsRepository.create({
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: item.quantity,
          subtotal: product.price * item.quantity,
          sku: product.sku,
          attributes: product.attributes,
        });
        
        items.push(orderItem);
        subtotal += orderItem.subtotal;
        
        // Update product stock
        await this.productsService.update(product.id, {
          quantity: product.quantity - item.quantity,
        });
      }
    } else {
      throw new BadRequestException('No items provided for order');
    }
    
    // Calculate shipping fee (this could be more complex based on your business rules)
    const shippingFee = 30000; // Fixed fee for simplicity
    
    // Calculate total
    const totalAmount = subtotal + shippingFee - discount;
    
    // Update order with calculated values
    order.totalAmount = totalAmount;
    order.shippingFee = shippingFee;
    order.items = items;
    
    // Save order
    const savedOrder = await this.ordersRepository.save(order);
    
    // If payment method is not COD, create a payment record
    if (paymentMethod !== PaymentMethod.COD) {
      await this.paymentsService.createOrderPayment(savedOrder);
    }
    
    return savedOrder;
  }

  async updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id);
    const { status } = updateOrderStatusDto;
    
    // Update timestamps based on status
    if (status === OrderStatus.SHIPPED && !order.shippedAt) {
      order.shippedAt = new Date();
    } else if (status === OrderStatus.DELIVERED && !order.deliveredAt) {
      order.deliveredAt = new Date();
      order.isPaid = true;
      order.paidAt = new Date();
    } else if (status === OrderStatus.CANCELLED && !order.cancelledAt) {
      order.cancelledAt = new Date();
      
      // Return items to inventory
      await this.returnItemsToInventory(order);
    }
    
    // Update order status
    order.status = status;
    
    return this.ordersRepository.save(order);
  }

  async cancelOrder(id: number, userId: number): Promise<Order> {
    const order = await this.findOneByUser(id, userId);
    
    // Check if order can be cancelled
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PROCESSING) {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }
    
    // Update order status
    order.status = OrderStatus.CANCELLED;
    order.cancelledAt = new Date();
    
    // Return items to inventory
    await this.returnItemsToInventory(order);
    
    return this.ordersRepository.save(order);
  }
  
  private async returnItemsToInventory(order: Order): Promise<void> {
    for (const item of order.items) {
      const product = await this.productsService.findOne(item.productId);
      
      // Return quantity to product inventory
      await this.productsService.update(product.id, {
        quantity: product.quantity + item.quantity,
      });
    }
  }
  
  private generateOrderNumber(): string {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
  }
}
