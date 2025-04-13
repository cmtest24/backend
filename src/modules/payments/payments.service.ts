import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { OrdersService } from '../orders/orders.service';
import { Order, OrderStatus } from '../orders/entities/order.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private ordersService: OrdersService,
  ) {}

  async create(userId: string, createPaymentDto: CreatePaymentDto): Promise<Payment> {
    // Verify that the order exists and belongs to the user
    const order = await this.ordersService.findOne(userId, createPaymentDto.orderId);
    
    // Check that order is in a valid state
    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot create payment for cancelled order');
    }
    
    // Check if payment already exists for this order
    const existingPayment = await this.paymentsRepository.findOne({
      where: { 
        orderId: order.id, 
        status: PaymentStatus.COMPLETED 
      },
    });
    
    if (existingPayment) {
      throw new BadRequestException('Payment already completed for this order');
    }
    
    // Create the payment
    const payment = this.paymentsRepository.create({
      orderId: order.id,
      method: createPaymentDto.method,
      amount: order.total,
      status: PaymentStatus.PENDING,
      paymentDetails: createPaymentDto.paymentDetails || {},
    });
    
    // For COD (Cash on Delivery), set as pending until delivery
    if (payment.method === 'cod') {
      payment.status = PaymentStatus.PENDING;
    }
    
    // For demonstration, we'll simulate payment processing here
    // In a real app, you would integrate with payment gateways
    this.processPayment(payment, order);
    
    return this.paymentsRepository.save(payment);
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }
  
  // In a real-world app, this would be handled by a payment gateway callback
  private async processPayment(payment: Payment, order: Order): Promise<void> {
    // Simulate successful payment for all non-COD methods
    if (payment.method !== 'cod') {
      payment.status = PaymentStatus.COMPLETED;
      payment.transactionId = `tx_${Date.now()}`;
      
      // Update order status to processing after payment
      await this.ordersService.updateStatus(order.id, {
        status: OrderStatus.PROCESSING
      });
    }
  }
  
  // In a real app, this would be called by a webhook from the payment provider
  async updatePaymentStatus(id: string, status: PaymentStatus, transactionId?: string): Promise<Payment> {
    const payment = await this.findOne(id);
    
    payment.status = status;
    
    if (transactionId) {
      payment.transactionId = transactionId;
    }
    
    // If payment is completed, update order status
    if (status === PaymentStatus.COMPLETED) {
      await this.ordersService.updateStatus(payment.orderId, {
        status: OrderStatus.PROCESSING
      });
    } else if (status === PaymentStatus.FAILED) {
      // If payment failed, we don't cancel the order automatically
      // as the user might want to try another payment method
    }
    
    return this.paymentsRepository.save(payment);
  }
}
