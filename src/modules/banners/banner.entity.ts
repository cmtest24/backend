import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  imageUrl: string;

  @Column()
  shortTitle: string;

  @Column()
  longTitle: string;

  @Column()
  link: string;

  @Column()
  order: number;
}