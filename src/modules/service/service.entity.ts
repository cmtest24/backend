import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../categories/entities/category.entity';

@Entity()
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  categoryId: string;

  @Column()
  description: string;

  @Column()
  longdescription: string;

  @Column()
  image: string;

  @Column({ type: 'float', default: 0 })
  price: number;

  @Column({ type: 'float', nullable: true })
  salePrice: number | null;
}