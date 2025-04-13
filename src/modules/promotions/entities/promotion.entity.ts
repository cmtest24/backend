import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index
} from 'typeorm';

export enum PromotionType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_SHIPPING = 'free_shipping',
}

@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  @Index()
  code: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PromotionType,
    default: PromotionType.PERCENTAGE,
  })
  type: PromotionType;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  minimumPurchase: number;

  @Column('int', { nullable: true })
  usageLimit: number;

  @Column('int', { default: 0 })
  usageCount: number;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
