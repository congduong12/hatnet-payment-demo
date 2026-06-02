import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { EntityManager } from 'typeorm';
import type { CartEntity } from '../../cart/entities/cart.entity.js';
import type { CartItemEntity } from '../../cart/entities/cart-item.entity.js';
import type { ProductEntity } from '../../products/entities/product.entity.js';
import type { InternalUser } from '../../users/user.types.js';
import type { OrderEntity } from '../entities/order.entity.js';
import type { OrderItemEntity } from '../entities/order-item.entity.js';
import { CheckoutRepository } from './checkout.repository.js';

const user: InternalUser = {
  id: '11111111-1111-4111-8111-111111111111',
  externalAuthProvider: 'clerk',
  externalAuthUserId: 'user_test_123',
  currentPlan: 'FREE',
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
};

function makeCart(): CartEntity {
  return {
    id: '33333333-3333-4333-8333-333333333333',
    userId: user.id,
    status: 'ACTIVE',
  } as CartEntity;
}

function makeProduct(overrides: Partial<ProductEntity> = {}): ProductEntity {
  return {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Pro Plan',
    priceAmount: 1000,
    priceCurrency: 'USD',
    metadata: { plan: 'PRO' },
    isActive: true,
    ...overrides,
  } as ProductEntity;
}

function makeCartItem(product = makeProduct()): CartItemEntity {
  return {
    id: '44444444-4444-4444-8444-444444444444',
    cartId: '33333333-3333-4333-8333-333333333333',
    productId: product.id,
    quantity: 2,
    product,
  } as CartItemEntity;
}

function makeManager(overrides: Partial<EntityManager> = {}): EntityManager {
  return {
    findOne: vi.fn().mockResolvedValue(makeCart()),
    find: vi.fn().mockResolvedValue([makeCartItem()]),
    save: vi.fn(async (_target: unknown, payload: unknown) => {
      if (Array.isArray(payload)) {
        return payload.map((item, index) => ({
          id: `55555555-5555-4555-8555-55555555555${index}`,
          createdAt: new Date('2026-06-01T00:00:00.000Z'),
          ...(item as object),
        })) as OrderItemEntity[];
      }

      return {
        id: '66666666-6666-4666-8666-666666666666',
        createdAt: new Date('2026-06-01T00:00:00.000Z'),
        updatedAt: new Date('2026-06-01T00:00:00.000Z'),
        ...(payload as object),
      } as OrderEntity;
    }),
    update: vi.fn().mockResolvedValue({ affected: 1 }),
    ...overrides,
  } as unknown as EntityManager;
}

function makeRepository(manager: EntityManager): CheckoutRepository {
  const entityManager = {
    transaction: vi.fn((callback: (transactionManager: EntityManager) => Promise<unknown>) => callback(manager)),
  } as unknown as EntityManager;

  return new CheckoutRepository(entityManager);
}

describe('CheckoutRepository', () => {
  it('persists order snapshots and closes the active cart in one transaction', async () => {
    const manager = makeManager();
    const repository = makeRepository(manager);

    const result = await repository.prepareCheckout({
      user,
      usdToVndRate: 24850,
      fxSource: 'static-config',
      fxAppliedAt: new Date('2026-06-01T00:00:00.000Z'),
    });

    expect(result.order).toMatchObject({
      status: 'PENDING_PAYMENT',
      subtotalAmount: 498000,
      payableAmount: 498000,
      checkoutCurrency: 'VND',
      fxRate: 24850,
    });
    expect(result.items[0]).toMatchObject({
      orderId: result.order.id,
      productName: 'Pro Plan',
      quantity: 2,
      checkoutUnitPriceAmount: 249000,
      checkoutLineAmount: 498000,
    });
    expect(manager.update).toHaveBeenCalledWith(expect.any(Function), { id: makeCart().id }, { status: 'CHECKED_OUT' });
  });

  it('rejects an empty active cart', async () => {
    const manager = makeManager({ find: vi.fn().mockResolvedValue([]) } as Partial<EntityManager>);
    const repository = makeRepository(manager);

    await expect(
      repository.prepareCheckout({
        user,
        usdToVndRate: 24850,
        fxSource: 'static-config',
        fxAppliedAt: new Date('2026-06-01T00:00:00.000Z'),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(manager.update).not.toHaveBeenCalled();
  });

  it('rejects inactive products before persisting an order', async () => {
    const inactiveProduct = makeProduct({ isActive: false });
    const manager = makeManager({ find: vi.fn().mockResolvedValue([makeCartItem(inactiveProduct)]) } as Partial<EntityManager>);
    const repository = makeRepository(manager);

    await expect(
      repository.prepareCheckout({
        user,
        usdToVndRate: 24850,
        fxSource: 'static-config',
        fxAppliedAt: new Date('2026-06-01T00:00:00.000Z'),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(manager.save).not.toHaveBeenCalled();
    expect(manager.update).not.toHaveBeenCalled();
  });
});

