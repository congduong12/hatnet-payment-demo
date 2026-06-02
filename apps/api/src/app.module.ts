import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { CartModule } from './cart/cart.module.js';
import { CheckoutModule } from './checkout/checkout.module.js';
import { DatabaseModule } from './database/database.module.js';
import { DatabaseHealthController } from './database/database-health.controller.js';
import { HealthController } from './health.controller.js';
import { ProductsModule } from './products/products.module.js';
import { MeController } from './users/me.controller.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [DatabaseModule, UsersModule, ProductsModule, AuthModule, CartModule, CheckoutModule],
  controllers: [HealthController, DatabaseHealthController, MeController],
})
export class AppModule {}
