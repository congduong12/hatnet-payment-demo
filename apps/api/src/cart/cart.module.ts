import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { ProductsModule } from '../products/products.module.js';
import { UsersModule } from '../users/users.module.js';
import { CartController } from './cart.controller.js';
import { CartService } from './cart.service.js';
import { CartItemEntity } from './entities/cart-item.entity.js';
import { CartEntity } from './entities/cart.entity.js';
import { CartRepository } from './repositories/cart.repository.js';

@Module({
  imports: [TypeOrmModule.forFeature([CartEntity, CartItemEntity]), AuthModule, UsersModule, ProductsModule],
  controllers: [CartController],
  providers: [CartRepository, CartService],
  exports: [CartRepository, CartService],
})
export class CartModule {}
