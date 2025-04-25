import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class About {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  content: string;

  @Column({ nullable: true })
  mission: string;

  @Column({ nullable: true })
  vision: string;

  @Column({ nullable: true })
  history: string;
}