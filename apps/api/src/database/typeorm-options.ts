import type { DataSourceOptions } from 'typeorm';
import { loadEnv } from '../env.js';
import { ProductEntity } from '../products/entities/product.entity.js';
import { UserEntity } from '../users/entities/user.entity.js';
import { CreateUsersTable1717200000000 } from '../migrations/1717200000000-create-users-table.js';
import { CreateProductsTable1717286400000 } from '../migrations/1717286400000-create-products-table.js';

export function createTypeOrmOptions(): DataSourceOptions {
  const env = loadEnv();

  return {
    type: 'postgres',
    url: env.DATABASE_URL,
    entities: [UserEntity, ProductEntity],
    migrations: [CreateUsersTable1717200000000, CreateProductsTable1717286400000],
    synchronize: false,
    migrationsRun: false,
    logging: false,
  };
}
