import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity.js';
import { UserRepository } from './repositories/user.repository.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UserRepository, UsersService],
  exports: [UserRepository, UsersService],
})
export class UsersModule {}
