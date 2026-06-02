import { Inject, Injectable } from '@nestjs/common';
import type { VerifiedAuth } from '../auth/auth.types.js';
import { loadEnv } from '../env.js';
import { UsersService } from '../users/users.service.js';
import type { CheckoutOrderItemSummary, CheckoutOrderSummary } from './checkout.types.js';
import type { OrderItemEntity } from './entities/order-item.entity.js';
import type { OrderEntity } from './entities/order.entity.js';
import { CheckoutRepository } from './repositories/checkout.repository.js';

const FX_SOURCE = 'static-config';

@Injectable()
export class CheckoutService {
  constructor(
    @Inject(CheckoutRepository) private readonly checkoutRepository: CheckoutRepository,
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {}

  async prepareCheckout(auth: VerifiedAuth): Promise<CheckoutOrderSummary> {
    const user = await this.usersService.syncFromAuth(auth);
    const env = loadEnv();
    const result = await this.checkoutRepository.prepareCheckout({
      user,
      usdToVndRate: env.USD_TO_VND_RATE,
      fxSource: FX_SOURCE,
      fxAppliedAt: new Date(),
    });

    return this.toSummary(result.order, result.items);
  }

  private toSummary(order: OrderEntity, items: OrderItemEntity[]): CheckoutOrderSummary {
    return {
      id: order.id,
      status: order.status,
      subtotalAmount: order.subtotalAmount,
      discountAmount: order.discountAmount,
      payableAmount: order.payableAmount,
      checkoutCurrency: order.checkoutCurrency,
      fxRate: order.fxRate,
      fxSource: order.fxSource,
      roundingMode: order.roundingMode,
      items: items.map((item) => this.toItemSummary(item)),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }

  private toItemSummary(item: OrderItemEntity): CheckoutOrderItemSummary {
    return {
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      originalPriceAmount: item.originalPriceAmount,
      originalPriceCurrency: item.originalPriceCurrency,
      checkoutUnitPriceAmount: item.checkoutUnitPriceAmount,
      checkoutLineAmount: item.checkoutLineAmount,
    };
  }
}

