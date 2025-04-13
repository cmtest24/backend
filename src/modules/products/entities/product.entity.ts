import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  ManyToOne, 
  JoinColumn, 
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index 
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Review } from '../../reviews/entities/review.entity';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { Wishlist } from '../../wishlist/entities/wishlist.entity';

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
}

@Entity('products')
@Index(['name'])
@Index(['slug'], { unique: true })
@Index(['categoryId'])
@Index(['status'])
@Index(['isFeatured'])
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  shortDescription: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  originalPrice: number;

  @Column({ default: 0 })
  quantity: number;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column({ nullable: true })
  thumbnail: string;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: ProductStatus;

  @Column({ default: false })
  isFeatured: boolean;

  @Column('simple-json', { nullable: true })
  metadata: any;

  @Column('simple-json', { nullable: true })
  attributes: any;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  avgRating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ nullable: true })
  sku: string;

  @Column({ nullable: true })
  barcode: string;

  @ManyToOne(() => Category, category => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column()
  categoryId: number;

  @OneToMany(() => Review, review => review.product)
  reviews: Review[];

  @OneToMany(() => CartItem, cartItem => cartItem.product)
  cartItems: CartItem[];

  @OneToMany(() => OrderItem, orderItem => orderItem.product)
  orderItems: OrderItem[];

  @OneToMany(() => Wishlist, wishlist => wishlist.product)
  wishlistItems: Wishlist[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
