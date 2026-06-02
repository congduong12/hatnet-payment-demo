import { describe, expect, it, vi } from 'vitest';
import type { VerifiedAuth } from '../auth/auth.types.js';
import type { InternalUser } from '../users/user.types.js';
import type { UsersService } from '../users/users.service.js';
import { CheckoutService } from './checkout.service.js';
import type { OrderItemEntity } from './entities/order-item.entity.js';
import type { OrderEntity } from './entities/order.entity.js';
import type { CheckoutRepository } from './repositories/checkout.repository.js';

const auth: VerifiedAuth = {
  externalAuthProvider: 'clerk',
  externalAuthUserId: 'user_test_123',
};

const user: InternalUser = {
  id: '11111111-1111-4111-8111-111111111111',
  externalAuthProvider: 'clerk',
  externalAuthUserId: 'user_test_123',
  currentPlan: 'FREE',
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
};

describe('CheckoutService', () => {
  it('uses verified auth, static FX config, and returns an order summary', async () => {
    const createdAt = new Date('2026-06-01T00:00:00.000Z');
    const order = {
      id: '66666666-6666-4666-8666-666666666666',
      status: 'PENDING_PAYMENT',
      subtotalAmount: 249000,
      discountAmount: 0,
      payableAmount: 249000,
      checkoutCurrency: 'VND',
      fxRate: 24850,
      fxSource: 'static-config',
      roundingMode: 'ROUND_UP_TO_1000_VND',
      createdAt,
      updatedAt: createdAt,
    } as OrderEntity;
    const items = [
      {
        productId: '22222222-2222-4222-8222-222222222222',
        productName: 'Pro Plan',
        quantity: 1,
        originalPriceAmount: 1000,
        originalPriceCurrency: 'USD',
        checkoutUnitPriceAmount: 249000,
        checkoutLineAmount: 249000,
      } as OrderItemEntity,
    ];
    const checkoutRepository = {
      prepareCheckout: vi.fn().mockResolvedValue({ order, items }),
    } as unknown as CheckoutRepository;
    const service = new CheckoutService(
      checkoutRepository,
      { syncFromAuth: vi.fn().mockResolvedValue(user) } as unknown as UsersService,
    );

    const summary = await service.prepareCheckout(auth);

    expect(checkoutRepository.prepareCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        user,
        usdToVndRate: 24850,
        fxSource: 'static-config',
      }),
    );
    expect(summary).toMatchObject({
      id: order.id,
      status: 'PENDING_PAYMENT',
      payableAmount: 249000,
      items: [{ productName: 'Pro Plan', checkoutLineAmount: 249000 }],
      createdAt: '2026-06-01T00:00:00.000Z',
    });
  });
});

