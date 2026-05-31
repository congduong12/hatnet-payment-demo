import type { DataSourceOptions } from 'typeorm';
import { loadEnv } from '../env.js';
import { UserEntity } from '../users/entities/user.entity.js';
import { CreateUsersTable1717200000000 } from '../migrations/1717200000000-create-users-table.js';

export function createTypeOrmOptions(): DataSourceOptions {
  const env = loadEnv();

  return {
    type: 'postgres',
    url: env.DATABASE_URL,
    entities: [UserEntity],
    migrations: [CreateUsersTable1717200000000],
    synchronize: false,
    migrationsRun: false,
    logging: false,
  };
}
