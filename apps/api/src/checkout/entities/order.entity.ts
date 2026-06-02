import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { OrderStatus, RoundingMode } from '../checkout.types.js';

@Entity({ name: 'orders' })
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ type: 'varchar', length: 32 })
  status!: OrderStatus;

  @Column({ name: 'subtotal_amount', type: 'integer' })
  subtotalAmount!: number;

  @Column({ name: 'discount_amount', type: 'integer' })
  discountAmount!: number;

  @Column({ name: 'payable_amount', type: 'integer' })
  payableAmount!: number;

  @Column({ name: 'checkout_currency', type: 'varchar', length: 8 })
  checkoutCurrency!: 'VND';

  @Column({ name: 'fx_rate', type: 'integer' })
  fxRate!: number;

  @Column({ name: 'fx_source', type: 'varchar', length: 64 })
  fxSource!: string;

  @Column({ name: 'fx_applied_at', type: 'timestamptz' })
  fxAppliedAt!: Date;

  @Column({ name: 'rounding_mode', type: 'varchar', length: 64 })
  roundingMode!: RoundingMode;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

