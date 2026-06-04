import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { EntityManager } from 'typeorm';
import type { CartEntity } from '../entities/cart.entity.js';
import type { CartItemEntity } from '../entities/cart-item.entity.js';
import { CartRepository } from './cart.repository.js';

const cartId = '33333333-3333-4333-8333-333333333333';
const itemId = '44444444-4444-4444-8444-444444444444';
const productId = '22222222-2222-4222-8222-222222222222';

function makeCart(): CartEntity {
  return {
    id: cartId,
    status: 'ACTIVE',
  } as CartEntity;
}

function makeItem(): CartItemEntity {
  return {
    id: itemId,
    cartId,
    productId,
    quantity: 1,
  } as CartItemEntity;
}

function makeRepository(transactionManager: EntityManager): CartRepository {
  const entityManager = {
    transaction: vi.fn((callback: (manager: EntityManager) => Promise<unknown>) => callback(transactionManager)),
  } as unknown as EntityManager;

  return new CartRepository(entityManager);
}

function makeManager(overrides: Partial<EntityManager> = {}): EntityManager {
  return {
    findOne: vi.fn().mockResolvedValue(makeCart()),
    query: vi.fn().mockResolvedValue([{ id: itemId }]),
    save: vi.fn().mockResolvedValue(makeItem()),
    remove: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue({ affected: 1 }),
    ...overrides,
  } as unknown as EntityManager;
}

describe('CartRepository checkout coordination', () => {
  it('locks the active cart before adding item quantity', async () => {
    const manager = makeManager();
    const repository = makeRepository(manager);

    const added = await repository.addItemQuantity(cartId, productId, 2, 10);

    expect(added).toBe(true);
    expect(manager.findOne).toHaveBeenCalledWith(expect.any(Function), {
      where: { id: cartId, status: 'ACTIVE' },
      lock: { mode: 'pessimistic_write' },
    });
    expect(manager.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO "cart_items"'), [
      cartId,
      productId,
      2,
      10,
    ]);
  });

  it('rejects cart item writes when the cart is no longer active', async () => {
    const manager = makeManager({ findOne: vi.fn().mockResolvedValue(null) } as Partial<EntityManager>);
    const repository = makeRepository(manager);

    await expect(repository.addItemQuantity(cartId, productId, 1, 10)).rejects.toBeInstanceOf(BadRequestException);
    expect(manager.query).not.toHaveBeenCalled();
  });

  it('updates an item quantity only after locking the active cart and item row', async () => {
    const manager = makeManager({
      findOne: vi.fn().mockResolvedValueOnce(makeCart()).mockResolvedValueOnce(makeItem()),
    } as Partial<EntityManager>);
    const repository = makeRepository(manager);

    const updated = await repository.updateItemQuantity(cartId, itemId, 3);

    expect(updated).toBe(true);
    expect(manager.findOne).toHaveBeenNthCalledWith(1, expect.any(Function), {
      where: { id: cartId, status: 'ACTIVE' },
      lock: { mode: 'pessimistic_write' },
    });
    expect(manager.findOne).toHaveBeenNthCalledWith(2, expect.any(Function), {
      where: { id: itemId, cartId },
      lock: { mode: 'pessimistic_write' },
    });
    expect(manager.save).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({ id: itemId, quantity: 3 }));
  });

  it('removes an item only after locking the active cart and item row', async () => {
    const item = makeItem();
    const manager = makeManager({
      findOne: vi.fn().mockResolvedValueOnce(makeCart()).mockResolvedValueOnce(item),
    } as Partial<EntityManager>);
    const repository = makeRepository(manager);

    const removed = await repository.removeItemById(cartId, itemId);

    expect(removed).toBe(true);
    expect(manager.remove).toHaveBeenCalledWith(expect.any(Function), item);
  });

  it('locks the active cart before clearing items', async () => {
    const manager = makeManager();
    const repository = makeRepository(manager);

    await repository.clearItems(cartId);

    expect(manager.findOne).toHaveBeenCalledWith(expect.any(Function), {
      where: { id: cartId, status: 'ACTIVE' },
      lock: { mode: 'pessimistic_write' },
    });
    expect(manager.delete).toHaveBeenCalledWith(expect.any(Function), { cartId });
  });
});
