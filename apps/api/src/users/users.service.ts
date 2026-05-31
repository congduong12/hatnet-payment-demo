import { Injectable } from '@nestjs/common';
import type { VerifiedAuth } from '../auth/auth.types.js';
import type { InternalUser } from './user.types.js';

@Injectable()
export class UsersService {
  private readonly usersByExternalId = new Map<string, InternalUser>();

  syncFromAuth(auth: VerifiedAuth): InternalUser {
    const now = new Date().toISOString();
    const existing = this.usersByExternalId.get(auth.externalAuthUserId);

    if (existing) {
      const updated = {
        ...existing,
        email: auth.email ?? existing.email,
        name: auth.name ?? existing.name,
        avatarUrl: auth.avatarUrl ?? existing.avatarUrl,
        updatedAt: now,
      };
      this.usersByExternalId.set(auth.externalAuthUserId, updated);

      return updated;
    }

    const user: InternalUser = {
      id: `usr_${crypto.randomUUID()}`,
      externalAuthProvider: auth.externalAuthProvider,
      externalAuthUserId: auth.externalAuthUserId,
      email: auth.email,
      name: auth.name,
      avatarUrl: auth.avatarUrl,
      currentPlan: 'FREE',
      createdAt: now,
      updatedAt: now,
    };
    this.usersByExternalId.set(auth.externalAuthUserId, user);

    return user;
  }
}
