import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { CartStatus } from '../cart.types.js';

@Entity({ name: 'carts' })
@Index('IDX_carts_active_user', ['userId'], { unique: true, where: `"status" = 'ACTIVE'` })
export class CartEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 32, default: 'ACTIVE' })
  status!: CartStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
