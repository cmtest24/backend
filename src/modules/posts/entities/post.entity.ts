import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index
} from 'typeorm';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  title: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column('text')
  content: string;

  @Column({ nullable: true })
  summary: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: true })
  isPublished: boolean;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ nullable: true })
  authorName: string;

  @Column({ default: 0 })
  viewCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  publishedAt: Date;
}
