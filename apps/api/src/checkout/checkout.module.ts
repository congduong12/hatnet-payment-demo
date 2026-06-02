import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItemEntity } from '../cart/entities/cart-item.entity.js';
import { CartEntity } from '../cart/entities/cart.entity.js';
import { UsersModule } from '../users/users.module.js';
import { OrderItemEntity } from './entities/order-item.entity.js';
import { OrderEntity } from './entities/order.entity.js';
import { CheckoutRepository } from './repositories/checkout.repository.js';
import { CheckoutService } from './checkout.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([CartEntity, CartItemEntity, OrderEntity, OrderItemEntity]), UsersModule],
  providers: [CheckoutRepository, CheckoutService],
  exports: [CheckoutService],
})
export class CheckoutModule {}

