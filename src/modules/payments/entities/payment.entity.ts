import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn, 
  ManyToOne, 
  JoinColumn,
  Index 
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentProvider {
  BANK_TRANSFER = 'bank_transfer',
  VNPAY = 'vnpay',
  MOMO = 'momo',
  CREDIT_CARD = 'credit_card',
  PAYPAL = 'paypal',
  ZALOPAY = 'zalopay',
}

@Entity('payments')
@Index(['orderId'])
@Index(['status'])
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  transactionId: string;

  @ManyToOne(() => Order, order => order.payments)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  orderId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentProvider,
  })
  provider: PaymentProvider;

  @Column({ nullable: true })
  paymentUrl: string;

  @Column('simple-json', { nullable: true })
  providerResponse: any;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column('simple-json', { nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
