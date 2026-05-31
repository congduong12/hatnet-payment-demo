import { describe, expect, it } from 'vitest';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  it('creates a Free internal user from verified auth', () => {
    const service = new UsersService();

    const user = service.syncFromAuth({
      externalAuthProvider: 'clerk',
      externalAuthUserId: 'user_test_123',
      email: 'demo@example.com',
      name: 'Demo User',
    });

    expect(user.externalAuthUserId).toBe('user_test_123');
    expect(user.email).toBe('demo@example.com');
    expect(user.currentPlan).toBe('FREE');
  });

  it('updates user profile data without changing the internal id', () => {
    const service = new UsersService();
    const first = service.syncFromAuth({
      externalAuthProvider: 'clerk',
      externalAuthUserId: 'user_test_123',
      email: 'old@example.com',
    });

    const updated = service.syncFromAuth({
      externalAuthProvider: 'clerk',
      externalAuthUserId: 'user_test_123',
      email: 'new@example.com',
      name: 'New Name',
    });

    expect(updated.id).toBe(first.id);
    expect(updated.email).toBe('new@example.com');
    expect(updated.name).toBe('New Name');
  });
});
