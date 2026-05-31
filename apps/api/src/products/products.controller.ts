import { Controller, Get, Inject, Param } from '@nestjs/common';
import type { ProductSummary } from './product.types.js';
import { ProductsService } from './products.service.js';

@Controller('products')
export class ProductsController {
  constructor(@Inject(ProductsService) private readonly productsService: ProductsService) {}

  @Get()
  async listProducts(): Promise<{ products: ProductSummary[] }> {
    return {
      products: await this.productsService.listActive(),
    };
  }

  @Get(':slug')
  async getProduct(@Param('slug') slug: string): Promise<{ product: ProductSummary }> {
    return {
      product: await this.productsService.getActiveBySlug(slug),
    };
  }
}
