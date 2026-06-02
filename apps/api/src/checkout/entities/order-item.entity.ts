import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProductEntity } from '../../products/entities/product.entity.js';
import type { RoundingMode } from '../checkout.types.js';
import { OrderEntity } from './order.entity.js';

@Entity({ name: 'order_items' })
export class OrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'order_id', type: 'uuid' })
  orderId!: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @Column({ name: 'product_name', type: 'varchar', length: 160 })
  productName!: string;

  @Column({ name: 'product_metadata', type: 'jsonb', default: () => "'{}'::jsonb" })
  productMetadata!: Record<string, unknown>;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({ name: 'original_price_amount', type: 'integer' })
  originalPriceAmount!: number;

  @Column({ name: 'original_price_currency', type: 'varchar', length: 8 })
  originalPriceCurrency!: string;

  @Column({ name: 'checkout_unit_price_amount', type: 'integer' })
  checkoutUnitPriceAmount!: number;

  @Column({ name: 'checkout_line_amount', type: 'integer' })
  checkoutLineAmount!: number;

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

  @ManyToOne(() => OrderEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: OrderEntity;

  @ManyToOne(() => ProductEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product!: ProductEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}

