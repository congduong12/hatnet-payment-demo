import { describe, expect, it, vi } from 'vitest';
import { UsersService } from './users.service.js';
import type { UserRepository } from './repositories/user.repository.js';
import type { UserEntity } from './entities/user.entity.js';

function makeUser(overrides: Partial<UserEntity> = {}): UserEntity {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    externalAuthProvider: 'clerk',
    externalAuthUserId: 'user_test_123',
    email: 'demo@example.com',
    name: 'Demo User',
    avatarUrl: null,
    currentPlan: 'FREE',
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
    updatedAt: new Date('2026-06-01T00:00:00.000Z'),
    ...overrides,
  } as UserEntity;
}

describe('UsersService', () => {
  it('creates a Free internal user from verified auth', async () => {
    const repository = {
      findByExternalAuth: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockImplementation(async (payload: Partial<UserEntity>) => makeUser(payload)),
    } as unknown as UserRepository;
    const service = new UsersService(repository);

    const user = await service.syncFromAuth({
      externalAuthProvider: 'clerk',
      externalAuthUserId: 'user_test_123',
      email: 'demo@example.com',
      name: 'Demo User',
    });

    expect(user.externalAuthUserId).toBe('user_test_123');
    expect(user.email).toBe('demo@example.com');
    expect(user.currentPlan).toBe('FREE');
  });

  it('updates user profile data without changing the internal id', async () => {
    const existing = makeUser({ email: 'old@example.com', name: null });
    const repository = {
      findByExternalAuth: vi.fn().mockResolvedValue(existing),
      save: vi.fn().mockImplementation(async (payload: Partial<UserEntity>) => makeUser(payload)),
    } as unknown as UserRepository;
    const service = new UsersService(repository);

    const updated = await service.syncFromAuth({
      externalAuthProvider: 'clerk',
      externalAuthUserId: 'user_test_123',
      email: 'new@example.com',
      name: 'New Name',
    });

    expect(updated.id).toBe(existing.id);
    expect(updated.email).toBe('new@example.com');
    expect(updated.name).toBe('New Name');
  });
});
