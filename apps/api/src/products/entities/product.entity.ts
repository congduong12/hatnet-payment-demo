import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { ProductType } from '../product.types.js';

@Entity({ name: 'products' })
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 180 })
  slug!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'short_description', type: 'varchar', length: 280 })
  shortDescription!: string;

  @Column({ name: 'product_type', type: 'varchar', length: 32 })
  productType!: ProductType;

  @Column({ name: 'price_amount', type: 'integer' })
  priceAmount!: number;

  @Column({ name: 'price_currency', type: 'varchar', length: 8 })
  priceCurrency!: string;

  @Column({ name: 'display_price', type: 'varchar', length: 64 })
  displayPrice!: string;

  @Column({ type: 'varchar', length: 80 })
  category!: string;

  @Column({ type: 'text', array: true, default: '{}' })
  tags!: string[];

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  metadata!: Record<string, unknown>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
