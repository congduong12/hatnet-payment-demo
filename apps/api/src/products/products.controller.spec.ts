import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import type { ProductSummary } from './product.types.js';

const proPlan: ProductSummary = {
  id: '22222222-2222-2222-2222-222222222222',
  name: 'Pro Plan',
  slug: 'pro-plan',
  description: 'Simulated monthly Pro subscription.',
  shortDescription: 'Monthly Pro access.',
  productType: 'PLAN',
  priceAmount: 1000,
  priceCurrency: 'USD',
  displayPrice: '$10',
  category: 'Plan',
  tags: ['plan', 'pro'],
  metadata: { plan: 'PRO' },
  isActive: true,
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
};

describe('ProductsController', () => {
  it('returns active products under a products envelope', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            listActive: vi.fn().mockResolvedValue([proPlan]),
          },
        },
      ],
    }).compile();
    const controller = moduleRef.get(ProductsController);

    await expect(controller.listProducts()).resolves.toEqual({ products: [proPlan] });
  });

  it('returns product detail under a product envelope', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            getActiveBySlug: vi.fn().mockResolvedValue(proPlan),
          },
        },
      ],
    }).compile();
    const controller = moduleRef.get(ProductsController);

    await expect(controller.getProduct('pro-plan')).resolves.toEqual({ product: proPlan });
  });
});
