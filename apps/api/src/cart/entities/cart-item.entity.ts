import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ProductEntity } from '../../products/entities/product.entity.js';
import { CartEntity } from './cart.entity.js';

@Entity({ name: 'cart_items' })
export class CartItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'cart_id', type: 'uuid' })
  cartId!: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId!: string;

  @Column({ type: 'integer' })
  quantity!: number;

  @ManyToOne(() => CartEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart!: CartEntity;

  @ManyToOne(() => ProductEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product!: ProductEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
