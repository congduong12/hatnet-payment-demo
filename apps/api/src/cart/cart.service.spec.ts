import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { VerifiedAuth } from '../auth/auth.types.js';
import type { ProductEntity } from '../products/entities/product.entity.js';
import type { ProductRepository } from '../products/repositories/product.repository.js';
import type { InternalUser } from '../users/user.types.js';
import type { UsersService } from '../users/users.service.js';
import { CartService } from './cart.service.js';
import type { CartEntity } from './entities/cart.entity.js';
import type { CartItemEntity } from './entities/cart-item.entity.js';
import type { CartRepository } from './repositories/cart.repository.js';

const auth: VerifiedAuth = {
  externalAuthProvider: 'clerk',
  externalAuthUserId: 'user_test_123',
  sessionId: 'sess_test_123',
};

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
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
    updatedAt: new Date('2026-06-01T00:00:00.000Z'),
  } as CartEntity;
}

function makeProduct(): ProductEntity {
  return {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Pro Plan',
    slug: 'pro-plan',
    displayPrice: '$10',
    priceAmount: 1000,
    priceCurrency: 'USD',
    isActive: true,
  } as ProductEntity;
}

describe('CartService', () => {
  it('adds an active product and calculates subtotal from product price', async () => {
    const cart = makeCart();
    const product = makeProduct();
    const savedItems: CartItemEntity[] = [
      {
        id: '44444444-4444-4444-8444-444444444444',
        cartId: cart.id,
        productId: product.id,
        quantity: 2,
        product,
      } as CartItemEntity,
    ];
    const cartRepository = {
      getOrCreateActiveCart: vi.fn().mockResolvedValue(cart),
      addItemQuantity: vi.fn().mockResolvedValue(true),
      listItems: vi.fn(async () => savedItems),
    } as unknown as CartRepository;
    const service = new CartService(
      cartRepository,
      { syncFromAuth: vi.fn().mockResolvedValue(user) } as unknown as UsersService,
      { findActiveById: vi.fn().mockResolvedValue(product) } as unknown as ProductRepository,
    );

    const summary = await service.addItem(auth, { productId: product.id, quantity: 2 });

    expect(cartRepository.addItemQuantity).toHaveBeenCalledWith(cart.id, product.id, 2, 10);
    expect(summary.itemCount).toBe(2);
    expect(summary.subtotalAmount).toBe(2000);
    expect(summary.items[0]).toMatchObject({
      slug: 'pro-plan',
      quantity: 2,
      lineTotalAmount: 2000,
    });
  });

  it('rejects quantity above ten when adding the same product again', async () => {
    const cart = makeCart();
    const product = makeProduct();
    const service = new CartService(
      {
        getOrCreateActiveCart: vi.fn().mockResolvedValue(cart),
        addItemQuantity: vi.fn().mockResolvedValue(false),
      } as unknown as CartRepository,
      { syncFromAuth: vi.fn().mockResolvedValue(user) } as unknown as UsersService,
      { findActiveById: vi.fn().mockResolvedValue(product) } as unknown as ProductRepository,
    );

    await expect(service.addItem(auth, { productId: product.id, quantity: 2 })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects malformed product IDs before querying products', async () => {
    const productRepository = { findActiveById: vi.fn() } as unknown as ProductRepository;
    const service = new CartService(
      {} as unknown as CartRepository,
      { syncFromAuth: vi.fn().mockResolvedValue(user) } as unknown as UsersService,
      productRepository,
    );

    await expect(service.addItem(auth, { productId: 'not-a-uuid', quantity: 1 })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(productRepository.findActiveById).not.toHaveBeenCalled();
  });

  it('rejects malformed item IDs before querying cart items', async () => {
    const cartRepository = { findItemById: vi.fn() } as unknown as CartRepository;
    const service = new CartService(
      cartRepository,
      { syncFromAuth: vi.fn().mockResolvedValue(user) } as unknown as UsersService,
      { findActiveById: vi.fn().mockResolvedValue(makeProduct()) } as unknown as ProductRepository,
    );

    await expect(service.updateItem(auth, 'not-a-uuid', { quantity: 1 })).rejects.toBeInstanceOf(BadRequestException);
    expect(cartRepository.findItemById).not.toHaveBeenCalled();
  });
});
