import { InjectEntityManager } from '@nestjs/typeorm';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
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
    const rows = await this.withActiveCartLock(cartId, async (manager) => {
      return (await manager.query(
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
    });

    return rows.length > 0;
  }

  async updateItemQuantity(cartId: string, itemId: string, quantity: number): Promise<boolean> {
    return this.withActiveCartLock(cartId, async (manager) => {
      const item = await manager.findOne(CartItemEntity, {
        where: { id: itemId, cartId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!item) {
        return false;
      }

      await manager.save(CartItemEntity, {
        ...item,
        quantity,
      });

      return true;
    });
  }

  async removeItemById(cartId: string, itemId: string): Promise<boolean> {
    return this.withActiveCartLock(cartId, async (manager) => {
      const item = await manager.findOne(CartItemEntity, {
        where: { id: itemId, cartId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!item) {
        return false;
      }

      await manager.remove(CartItemEntity, item);
      return true;
    });
  }

  async clearItems(cartId: string): Promise<void> {
    await this.withActiveCartLock(cartId, async (manager) => {
      await manager.delete(CartItemEntity, { cartId });
    });
  }

  private async withActiveCartLock<T>(cartId: string, operation: (manager: EntityManager) => Promise<T>): Promise<T> {
    return this.entityManager.transaction(async (manager) => {
      const cart = await manager.findOne(CartEntity, {
        where: { id: cartId, status: 'ACTIVE' },
        lock: { mode: 'pessimistic_write' },
      });

      if (!cart) {
        throw new BadRequestException('Active cart is no longer available');
      }

      return operation(manager);
    });
  }
}
