import type { DataSourceOptions } from 'typeorm';
import { CartItemEntity } from '../cart/entities/cart-item.entity.js';
import { CartEntity } from '../cart/entities/cart.entity.js';
import { OrderItemEntity } from '../checkout/entities/order-item.entity.js';
import { OrderEntity } from '../checkout/entities/order.entity.js';
import { loadEnv } from '../env.js';
import { ProductEntity } from '../products/entities/product.entity.js';
import { UserEntity } from '../users/entities/user.entity.js';
import { CreateUsersTable1717200000000 } from '../migrations/1717200000000-create-users-table.js';
import { CreateProductsTable1717286400000 } from '../migrations/1717286400000-create-products-table.js';
import { CreateCartTables1717372800000 } from '../migrations/1717372800000-create-cart-tables.js';
import { CreateOrdersTables1717465600000 } from '../migrations/1717465600000-create-orders-tables.js';

export function createTypeOrmOptions(): DataSourceOptions {
  const env = loadEnv();

  return {
    type: 'postgres',
    url: env.DATABASE_URL,
    entities: [UserEntity, ProductEntity, CartEntity, CartItemEntity, OrderEntity, OrderItemEntity],
    migrations: [
      CreateUsersTable1717200000000,
      CreateProductsTable1717286400000,
      CreateCartTables1717372800000,
      CreateOrdersTables1717465600000,
    ],
    synchronize: false,
    migrationsRun: false,
    logging: false,
  };
}
