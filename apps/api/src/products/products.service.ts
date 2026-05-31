import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ProductEntity } from './entities/product.entity.js';
import type { ProductSummary } from './product.types.js';
import { ProductRepository } from './repositories/product.repository.js';

@Injectable()
export class ProductsService {
  constructor(@Inject(ProductRepository) private readonly productRepository: ProductRepository) {}

  async listActive(): Promise<ProductSummary[]> {
    const products = await this.productRepository.findActive();
    return products.map((product) => this.toSummary(product));
  }

  async getActiveBySlug(slug: string): Promise<ProductSummary> {
    const product = await this.productRepository.findActiveBySlug(slug);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.toSummary(product);
  }

  private toSummary(product: ProductEntity): ProductSummary {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      productType: product.productType,
      priceAmount: product.priceAmount,
      priceCurrency: product.priceCurrency,
      displayPrice: product.displayPrice,
      category: product.category,
      tags: product.tags,
      metadata: product.metadata,
      isActive: product.isActive,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }
}
