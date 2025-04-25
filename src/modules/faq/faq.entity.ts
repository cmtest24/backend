import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Faq {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tieuDe: string;

  @Column()
  noiDung: string;
}