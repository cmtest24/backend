import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Payment, PaymentStatus, PaymentProvider } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { OrderStatus, PaymentMethod } from '../orders/entities/order.entity';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto, userId: number): Promise<Payment> {
    const { orderId, provider, returnUrl } = createPaymentDto;
    
    // Find order and verify ownership
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['items'],
    });
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }
    
    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have permission to pay for this order');
    }
    
    // Check if order is already paid
    if (order.isPaid) {
      throw new BadRequestException('Order is already paid');
    }
    
    // Check if payment already exists
    const existingPayment = await this.paymentsRepository.findOne({
      where: { orderId, status: PaymentStatus.PENDING },
    });
    
    if (existingPayment) {
      return existingPayment;
    }
    
    // Generate transaction ID
    const transactionId = `TXN-${uuidv4()}`;
    
    // Create payment
    const payment = this.paymentsRepository.create({
      transactionId,
      orderId,
      amount: order.totalAmount,
      provider,
      status: PaymentStatus.PENDING,
    });
    
    // Generate payment URL based on provider
    // This is just a simulation, real implementation would integrate with actual payment providers
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:8000';
    const callbackUrl = `${baseUrl}/api/payments/callback?transactionId=${payment.transactionId}`;
    const userReturnUrl = returnUrl || `${baseUrl}/payment-result`;
    
    let paymentUrl = '';
    
    switch (provider) {
      case PaymentProvider.VNPAY:
        paymentUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?amount=${order.totalAmount}&orderId=${order.orderNumber}&returnUrl=${encodeURIComponent(callbackUrl)}&userReturnUrl=${encodeURIComponent(userReturnUrl)}&txnRef=${payment.transactionId}`;
        break;
      case PaymentProvider.MOMO:
        paymentUrl = `https://test-payment.momo.vn/gw_payment/payment/qr?amount=${order.totalAmount}&orderId=${order.orderNumber}&returnUrl=${encodeURIComponent(callbackUrl)}&userReturnUrl=${encodeURIComponent(userReturnUrl)}&txnRef=${payment.transactionId}`;
        break;
      case PaymentProvider.BANK_TRANSFER:
        // For bank transfer, provide instruction
        payment.metadata = {
          bankName: 'Vietcombank',
          accountNumber: '1234567890',
          accountName: 'Đông Y Pharmacy',
          transferContent: `Payment for ${order.orderNumber}`,
        };
        paymentUrl = `${userReturnUrl}?txnRef=${payment.transactionId}&provider=bank`;
        break;
      default:
        paymentUrl = `${userReturnUrl}?txnRef=${payment.transactionId}&provider=${provider}`;
    }
    
    payment.paymentUrl = paymentUrl;
    
    // Save payment
    const savedPayment = await this.paymentsRepository.save(payment);
    
    return savedPayment;
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['order'],
    });
    
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    
    return payment;
  }
  
  async findByTransactionId(transactionId: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { transactionId },
      relations: ['order'],
    });
    
    if (!payment) {
      throw new NotFoundException(`Payment with transaction ID ${transactionId} not found`);
    }
    
    return payment;
  }
  
  async handlePaymentCallback(query: any): Promise<any> {
    const { transactionId, status } = query;
    
    if (!transactionId) {
      throw new BadRequestException('Transaction ID is required');
    }
    
    const payment = await this.findByTransactionId(transactionId);
    
    // Process payment based on provider response
    // This is a simplified version for demonstration
    if (status === 'success' || status === 'completed') {
      // Update payment status
      payment.status = PaymentStatus.COMPLETED;
      payment.paidAt = new Date();
      payment.providerResponse = query;
      
      // Update order
      const order = payment.order;
      order.isPaid = true;
      order.paidAt = new Date();
      
      // Update order status if it was pending
      if (order.status === OrderStatus.PENDING) {
        order.status = OrderStatus.PROCESSING;
      }
      
      await this.ordersRepository.save(order);
      await this.paymentsRepository.save(payment);
      
      return { success: true, message: 'Payment completed successfully' };
    } else if (status === 'failed' || status === 'cancel') {
      // Update payment status
      payment.status = PaymentStatus.FAILED;
      payment.providerResponse = query;
      
      await this.paymentsRepository.save(payment);
      
      return { success: false, message: 'Payment failed or cancelled' };
    }
    
    return { success: false, message: 'Unknown payment status' };
  }
  
  async createOrderPayment(order: Order): Promise<Payment> {
    // Map payment method to provider
    let provider: PaymentProvider;
    
    switch (order.paymentMethod) {
      case PaymentMethod.BANK_TRANSFER:
        provider = PaymentProvider.BANK_TRANSFER;
        break;
      case PaymentMethod.CREDIT_CARD:
        provider = PaymentProvider.CREDIT_CARD;
        break;
      case PaymentMethod.EWALLET:
        provider = PaymentProvider.MOMO; // Default to MOMO for e-wallet
        break;
      default:
        throw new BadRequestException('Invalid payment method for online payment');
    }
    
    // Create payment
    const transactionId = `TXN-${uuidv4()}`;
    
    const payment = this.paymentsRepository.create({
      transactionId,
      orderId: order.id,
      amount: order.totalAmount,
      provider,
      status: PaymentStatus.PENDING,
    });
    
    // Generate payment URL
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:8000';
    const callbackUrl = `${baseUrl}/api/payments/callback?transactionId=${payment.transactionId}`;
    const userReturnUrl = `${baseUrl}/payment-result`;
    
    let paymentUrl = '';
    
    switch (provider) {
      case PaymentProvider.VNPAY:
        paymentUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?amount=${order.totalAmount}&orderId=${order.orderNumber}&returnUrl=${encodeURIComponent(callbackUrl)}&userReturnUrl=${encodeURIComponent(userReturnUrl)}&txnRef=${payment.transactionId}`;
        break;
      case PaymentProvider.MOMO:
        paymentUrl = `https://test-payment.momo.vn/gw_payment/payment/qr?amount=${order.totalAmount}&orderId=${order.orderNumber}&returnUrl=${encodeURIComponent(callbackUrl)}&userReturnUrl=${encodeURIComponent(userReturnUrl)}&txnRef=${payment.transactionId}`;
        break;
      case PaymentProvider.BANK_TRANSFER:
        // For bank transfer, provide instruction
        payment.metadata = {
          bankName: 'Vietcombank',
          accountNumber: '1234567890',
          accountName: 'Đông Y Pharmacy',
          transferContent: `Payment for ${order.orderNumber}`,
        };
        paymentUrl = `${userReturnUrl}?txnRef=${payment.transactionId}&provider=bank`;
        break;
      case PaymentProvider.CREDIT_CARD:
        paymentUrl = `${baseUrl}/checkout/credit-card?orderId=${order.id}&amount=${order.totalAmount}&returnUrl=${encodeURIComponent(callbackUrl)}`;
        break;
      default:
        paymentUrl = `${userReturnUrl}?txnRef=${payment.transactionId}&provider=${provider}`;
    }
    
    payment.paymentUrl = paymentUrl;
    
    return this.paymentsRepository.save(payment);
  }
}
