import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseHealthService } from './database-health.service.js';
import { createTypeOrmOptions } from './typeorm-options.js';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => createTypeOrmOptions(),
    }),
  ],
  providers: [DatabaseHealthService],
  exports: [TypeOrmModule, DatabaseHealthService],
})
export class DatabaseModule {}
