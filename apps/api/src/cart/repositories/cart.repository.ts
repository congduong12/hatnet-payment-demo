import { InjectEntityManager } from '@nestjs/typeorm';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CartEntity } from '../entities/cart.entity.js';
import { CartItemEntity } from '../entities/cart-item.entity.js';

@Injectable()
export class CartRepository {
  constructor(@InjectEntityManager() private readonly entityManager: EntityManager) {}

  async getOrCreateActiveCart(userId: string): Promise<CartEntity> {
    const rows = (await this.entityManager.query(
      `
        INSERT INTO "carts" ("user_id", "status")
        VALUES ($1, 'ACTIVE')
        ON CONFLICT ("user_id") WHERE "status" = 'ACTIVE'
        DO UPDATE SET "updated_at" = "carts"."updated_at"
        RETURNING
          "id",
          "user_id" AS "userId",
          "status",
          "created_at" AS "createdAt",
          "updated_at" AS "updatedAt"
      `,
      [userId],
    )) as CartEntity[];

    const cart = rows[0];

    if (!cart) {
      throw new InternalServerErrorException('Active cart could not be created');
    }

    return cart;
  }

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

  async addItemQuantity(cartId: string, productId: string, quantity: number, maxQuantity: number): Promise<boolean> {
    const rows = (await this.entityManager.query(
      `
        INSERT INTO "cart_items" ("cart_id", "product_id", "quantity")
        VALUES ($1, $2, $3)
        ON CONFLICT ("cart_id", "product_id")
        DO UPDATE SET
          "quantity" = "cart_items"."quantity" + EXCLUDED."quantity",
          "updated_at" = now()
        WHERE "cart_items"."quantity" + EXCLUDED."quantity" <= $4
        RETURNING "id"
      `,
      [cartId, productId, quantity, maxQuantity],
    )) as Array<{ id: string }>;

    return rows.length > 0;
  }

  async removeItem(item: CartItemEntity): Promise<void> {
    await this.entityManager.remove(CartItemEntity, item);
  }

  async clearItems(cartId: string): Promise<void> {
    await this.entityManager.delete(CartItemEntity, { cartId });
  }
}
