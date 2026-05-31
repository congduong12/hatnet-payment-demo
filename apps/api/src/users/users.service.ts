import { Inject, Injectable } from '@nestjs/common';
import type { VerifiedAuth } from '../auth/auth.types.js';
import type { InternalUser } from './user.types.js';
import { UserRepository } from './repositories/user.repository.js';
import { UserEntity } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(@Inject(UserRepository) private readonly userRepository: UserRepository) {}

  async syncFromAuth(auth: VerifiedAuth): Promise<InternalUser> {
    const existing = await this.userRepository.findByExternalAuth(
      auth.externalAuthProvider,
      auth.externalAuthUserId,
    );

    if (existing) {
      const updated = await this.userRepository.save({
        ...existing,
        email: auth.email ?? existing.email,
        name: auth.name ?? existing.name,
        avatarUrl: auth.avatarUrl ?? existing.avatarUrl,
      });

      return this.toInternalUser(updated);
    }

    const user = await this.userRepository.save({
      externalAuthProvider: auth.externalAuthProvider,
      externalAuthUserId: auth.externalAuthUserId,
      email: auth.email,
      name: auth.name,
      avatarUrl: auth.avatarUrl,
      currentPlan: 'FREE',
    });

    return this.toInternalUser(user);
  }

  private toInternalUser(user: UserEntity): InternalUser {
    return {
      id: user.id,
      externalAuthProvider: user.externalAuthProvider,
      externalAuthUserId: user.externalAuthUserId,
      email: user.email ?? undefined,
      name: user.name ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
      currentPlan: user.currentPlan,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
