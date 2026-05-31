import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { BaseRepository } from '../../core/base/base.repository.js';
import { UserEntity } from '../entities/user.entity.js';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  constructor(@InjectEntityManager() entityManager: EntityManager) {
    super(UserEntity, entityManager, 'user');
  }

  async findByExternalAuth(provider: 'clerk', externalAuthUserId: string): Promise<UserEntity | null> {
    return this.newQuery()
      .builder()
      .andWhere('user.externalAuthProvider = :provider', { provider })
      .andWhere('user.externalAuthUserId = :externalAuthUserId', { externalAuthUserId })
      .getOne();
  }

  async save(user: Partial<UserEntity>): Promise<UserEntity> {
    return this.entityManager.save(UserEntity, user);
  }
}
