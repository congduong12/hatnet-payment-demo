import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { CartEntity } from '../entities/cart.entity.js';
import { CartItemEntity } from '../entities/cart-item.entity.js';

@Injectable()
export class CartRepository {
  constructor(@InjectEntityManager() private readonly entityManager: EntityManager) {}

  async findActiveByUserId(userId: string): Promise<CartEntity | null> {
    return this.entityManager.findOne(CartEntity, {
      where: { userId, status: 'ACTIVE' },
    });
  }

  async createActiveCart(userId: string): Promise<CartEntity> {
    return this.entityManager.save(CartEntity, {
      userId,
      status: 'ACTIVE',
    });
  }

  async findItem(cartId: string, productId: string): Promise<CartItemEntity | null> {
    return this.entityManager.findOne(CartItemEntity, {
      where: { cartId, productId },
      relations: { product: true },
    });
  }

  async findItemById(cartId: string, itemId: string): Promise<CartItemEntity | null> {
    return this.entityManager.findOne(CartItemEntity, {
      where: { id: itemId, cartId },
      relations: { product: true },
    });
  }

  async listItems(cartId: string): Promise<CartItemEntity[]> {
    return this.entityManager.find(CartItemEntity, {
      where: { cartId },
      relations: { product: true },
      order: { createdAt: 'ASC' },
    });
  }

  async saveItem(item: Partial<CartItemEntity>): Promise<CartItemEntity> {
    return this.entityManager.save(CartItemEntity, item);
  }

  async removeItem(item: CartItemEntity): Promise<void> {
    await this.entityManager.remove(CartItemEntity, item);
  }

  async clearItems(cartId: string): Promise<void> {
    await this.entityManager.delete(CartItemEntity, { cartId });
  }
}
