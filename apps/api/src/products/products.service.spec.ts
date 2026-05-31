import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { ProductEntity } from './entities/product.entity.js';
import type { ProductRepository } from './repositories/product.repository.js';
import { ProductsService } from './products.service.js';

function makeProduct(overrides: Partial<ProductEntity> = {}): ProductEntity {
  return {
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
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
    updatedAt: new Date('2026-06-01T00:00:00.000Z'),
    ...overrides,
  } as ProductEntity;
}

describe('ProductsService', () => {
  it('maps active products into API summaries', async () => {
    const repository = {
      findActive: vi.fn().mockResolvedValue([makeProduct()]),
    } as unknown as ProductRepository;
    const service = new ProductsService(repository);

    const products = await service.listActive();

    expect(products).toHaveLength(1);
    expect(products[0]).toMatchObject({
      slug: 'pro-plan',
      productType: 'PLAN',
      displayPrice: '$10',
      tags: ['plan', 'pro'],
      metadata: { plan: 'PRO' },
      createdAt: '2026-06-01T00:00:00.000Z',
    });
  });

  it('throws not found when an active slug is missing', async () => {
    const repository = {
      findActiveBySlug: vi.fn().mockResolvedValue(null),
    } as unknown as ProductRepository;
    const service = new ProductsService(repository);

    await expect(service.getActiveBySlug('missing-product')).rejects.toBeInstanceOf(NotFoundException);
  });
});
