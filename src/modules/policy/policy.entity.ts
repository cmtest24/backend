import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Policy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  tieuDe: string;

  @Column()
  noiDung: string;
}