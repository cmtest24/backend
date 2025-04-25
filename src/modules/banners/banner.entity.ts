import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  imageUrl: string;

  @Column()
  shortTitle: string;

  @Column({ nullable: true })
  longTitle: string;

  @Column({ nullable: true })
  link: string;

  @Column()
  order: number;
}