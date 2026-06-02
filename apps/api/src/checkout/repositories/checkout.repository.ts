import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { CartEntity } from '../../cart/entities/cart.entity.js';
import { CartItemEntity } from '../../cart/entities/cart-item.entity.js';
import type { InternalUser } from '../../users/user.types.js';
import type { RoundingMode } from '../checkout.types.js';
import { OrderItemEntity } from '../entities/order-item.entity.js';
import { OrderEntity } from '../entities/order.entity.js';
import { convertUsdCentsToRoundedVnd } from '../money.js';

type PrepareCheckoutOptions = {
  user: InternalUser;
  usdToVndRate: number;
  fxSource: string;
  fxAppliedAt: Date;
};

type OrderItemSnapshot = {
  productId: string;
  productName: string;
  productMetadata: Record<string, unknown>;
  quantity: number;
  originalPriceAmount: number;
  originalPriceCurrency: string;
  checkoutUnitPriceAmount: number;
  checkoutLineAmount: number;
  checkoutCurrency: 'VND';
  fxRate: number;
  fxSource: string;
  fxAppliedAt: Date;
  roundingMode: RoundingMode;
};

const ROUNDING_MODE: RoundingMode = 'ROUND_UP_TO_1000_VND';
const CHECKOUT_CURRENCY = 'VND';

@Injectable()
export class CheckoutRepository {
  constructor(@InjectEntityManager() private readonly entityManager: EntityManager) {}

  async prepareCheckout(options: PrepareCheckoutOptions): Promise<{ order: OrderEntity; items: OrderItemEntity[] }> {
    return this.entityManager.transaction(async (manager) => {
      const cart = await manager.findOne(CartEntity, {
        where: { userId: options.user.id, status: 'ACTIVE' },
        lock: { mode: 'pessimistic_write' },
      });

      if (!cart) {
        throw new BadRequestException('Active cart is empty');
      }

      const cartItems = await manager.find(CartItemEntity, {
        where: { cartId: cart.id },
        relations: { product: true },
        order: { createdAt: 'ASC' },
      });

      if (cartItems.length === 0) {
        throw new BadRequestException('Active cart is empty');
      }

      const snapshots = cartItems.map((item) => this.toOrderItemSnapshot(item, options));
      const subtotalAmount = snapshots.reduce((total, item) => total + item.checkoutLineAmount, 0);
      const discountAmount = 0;

      const order = await manager.save(OrderEntity, {
        userId: options.user.id,
        status: 'PENDING_PAYMENT',
        subtotalAmount,
        discountAmount,
        payableAmount: subtotalAmount - discountAmount,
        checkoutCurrency: CHECKOUT_CURRENCY,
        fxRate: options.usdToVndRate,
        fxSource: options.fxSource,
        fxAppliedAt: options.fxAppliedAt,
        roundingMode: ROUNDING_MODE,
      });

      const items = await manager.save(
        OrderItemEntity,
        snapshots.map((item) => ({
          ...item,
          orderId: order.id,
        })),
      );

      await manager.update(CartEntity, { id: cart.id }, { status: 'CHECKED_OUT' });

      return { order, items };
    });
  }

  private toOrderItemSnapshot(item: CartItemEntity, options: PrepareCheckoutOptions): OrderItemSnapshot {
    if (!item.product.isActive) {
      throw new BadRequestException('Inactive product cannot be checked out');
    }

    if (item.product.priceCurrency !== 'USD') {
      throw new BadRequestException('Only USD catalog prices can be checked out to VND');
    }

    const checkoutUnitPriceAmount = convertUsdCentsToRoundedVnd(item.product.priceAmount, options.usdToVndRate);

    return {
      productId: item.productId,
      productName: item.product.name,
      productMetadata: item.product.metadata,
      quantity: item.quantity,
      originalPriceAmount: item.product.priceAmount,
      originalPriceCurrency: item.product.priceCurrency,
      checkoutUnitPriceAmount,
      checkoutLineAmount: checkoutUnitPriceAmount * item.quantity,
      checkoutCurrency: CHECKOUT_CURRENCY,
      fxRate: options.usdToVndRate,
      fxSource: options.fxSource,
      fxAppliedAt: options.fxAppliedAt,
      roundingMode: ROUNDING_MODE,
    };
  }
}

