import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('store_info')
export class StoreInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  favicon: string;

  @Column({ nullable: true })
  facebook: string;

  @Column({ nullable: true })
  youtube: string;

  @Column({ nullable: true })
  googleMap: string;

  @Column({ nullable: true })
  hotline: string;

  @Column({ nullable: true })
  zalo: string;

  @Column({ nullable: true })
  workingHours: string;

  @Column({ type: 'jsonb', nullable: true, default: '[]' })
  addresses: { name: string; phoneNumber: string; address: string }[];
}