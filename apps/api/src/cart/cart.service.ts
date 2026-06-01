import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { z } from 'zod';
import type { VerifiedAuth } from '../auth/auth.types.js';
import { ProductRepository } from '../products/repositories/product.repository.js';
import { UsersService } from '../users/users.service.js';
import type { CartItemSummary, CartSummary } from './cart.types.js';
import { CartRepository } from './repositories/cart.repository.js';
import type { AddCartItemBody, UpdateCartItemBody } from './dto/cart.dto.js';
import type { CartEntity } from './entities/cart.entity.js';
import type { CartItemEntity } from './entities/cart-item.entity.js';

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 10;
const UUID_SCHEMA = z.uuid();

@Injectable()
export class CartService {
  constructor(
    @Inject(CartRepository) private readonly cartRepository: CartRepository,
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(ProductRepository) private readonly productRepository: ProductRepository,
  ) {}

  async getCart(auth: VerifiedAuth): Promise<CartSummary> {
    const cart = await this.getOrCreateActiveCart(auth);
    return this.toSummary(cart);
  }

  async addItem(auth: VerifiedAuth, body: AddCartItemBody): Promise<CartSummary> {
    const productId = this.parseProductId(body.productId);
    const quantity = this.parseQuantity(body.quantity ?? 1);
    const product = await this.productRepository.findActiveById(productId);

    if (!product) {
      throw new NotFoundException('Active product not found');
    }

    const cart = await this.getOrCreateActiveCart(auth);
    const added = await this.cartRepository.addItemQuantity(cart.id, product.id, quantity, MAX_QUANTITY);

    if (!added) {
      throw new BadRequestException(`quantity must be between ${MIN_QUANTITY} and ${MAX_QUANTITY}`);
    }

    return this.toSummary(cart);
  }

  async updateItem(auth: VerifiedAuth, itemId: string, body: UpdateCartItemBody): Promise<CartSummary> {
    const parsedItemId = this.parseUuid(itemId, 'itemId');
    const quantity = this.parseQuantity(body.quantity);
    const cart = await this.getOrCreateActiveCart(auth);
    const item = await this.cartRepository.findItemById(cart.id, parsedItemId);

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepository.saveItem({
      ...item,
      quantity,
    });

    return this.toSummary(cart);
  }

  async removeItem(auth: VerifiedAuth, itemId: string): Promise<CartSummary> {
    const parsedItemId = this.parseUuid(itemId, 'itemId');
    const cart = await this.getOrCreateActiveCart(auth);
    const item = await this.cartRepository.findItemById(cart.id, parsedItemId);

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepository.removeItem(item);
    return this.toSummary(cart);
  }

  async clearCart(auth: VerifiedAuth): Promise<CartSummary> {
    const cart = await this.getOrCreateActiveCart(auth);
    await this.cartRepository.clearItems(cart.id);
    return this.toSummary(cart);
  }

  private async getOrCreateActiveCart(auth: VerifiedAuth): Promise<CartEntity> {
    const user = await this.usersService.syncFromAuth(auth);
    return this.cartRepository.getOrCreateActiveCart(user.id);
  }

  private async toSummary(cart: CartEntity): Promise<CartSummary> {
    const items = await this.cartRepository.listItems(cart.id);
    const itemSummaries = items.map((item) => this.toItemSummary(item));
    const subtotalAmount = itemSummaries.reduce((total, item) => total + item.lineTotalAmount, 0);

    return {
      id: cart.id,
      status: cart.status,
      items: itemSummaries,
      subtotalAmount,
      currency: itemSummaries[0]?.priceCurrency ?? 'USD',
      itemCount: itemSummaries.reduce((total, item) => total + item.quantity, 0),
      createdAt: cart.createdAt.toISOString(),
      updatedAt: cart.updatedAt.toISOString(),
    };
  }

  private toItemSummary(item: CartItemEntity): CartItemSummary {
    return {
      id: item.id,
      productId: item.productId,
      slug: item.product.slug,
      name: item.product.name,
      displayPrice: item.product.displayPrice,
      priceAmount: item.product.priceAmount,
      priceCurrency: item.product.priceCurrency,
      quantity: item.quantity,
      lineTotalAmount: item.product.priceAmount * item.quantity,
    };
  }

  private parseProductId(value: unknown): string {
    return this.parseUuid(value, 'productId');
  }

  private parseUuid(value: unknown, field: string): string {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequestException(`${field} is required`);
    }

    const normalized = value.trim();

    if (!UUID_SCHEMA.safeParse(normalized).success) {
      throw new BadRequestException(`${field} must be a valid UUID`);
    }

    return normalized;
  }

  private parseQuantity(value: unknown): number {
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      throw new BadRequestException('quantity must be an integer');
    }

    this.assertQuantity(value);
    return value;
  }

  private assertQuantity(quantity: number): void {
    if (quantity < MIN_QUANTITY || quantity > MAX_QUANTITY) {
      throw new BadRequestException(`quantity must be between ${MIN_QUANTITY} and ${MAX_QUANTITY}`);
    }
  }
}
