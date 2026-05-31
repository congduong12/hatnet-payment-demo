import { INestApplication, CanActivate, ExecutionContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ClerkAuthGuard } from './clerk-auth.guard.js';
import type { AuthenticatedRequest } from './auth.types.js';
import { AuthController } from './auth.controller.js';
import { ClerkAuthService } from './clerk-auth.service.js';
import { MeController } from '../users/me.controller.js';
import { UsersService } from '../users/users.service.js';
import { UserRepository } from '../users/repositories/user.repository.js';
import type { UserEntity } from '../users/entities/user.entity.js';

class TestAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    request.auth = {
      externalAuthProvider: 'clerk',
      externalAuthUserId: 'user_test_123',
      sessionId: 'sess_test_123',
      email: 'demo@example.com',
      name: 'Demo User',
    };

    return true;
  }
}

describe('auth endpoints', () => {
  let app: INestApplication | undefined;

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  it('rejects /me when authorization is missing', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController, MeController],
      providers: [
        ClerkAuthGuard,
        ClerkAuthService,
        UsersService,
        {
          provide: UserRepository,
          useValue: createUserRepositoryStub(),
        },
      ],
    }).compile();
    const nestApp = moduleRef.createNestApplication();
    app = nestApp;
    await nestApp.init();

    await request(nestApp.getHttpServer()).get('/me').expect(401);
  });

  it('returns verified auth and synced internal user', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController, MeController],
      providers: [
        ClerkAuthGuard,
        ClerkAuthService,
        UsersService,
        {
          provide: UserRepository,
          useValue: createUserRepositoryStub(),
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useClass(TestAuthGuard)
      .compile();
    const nestApp = moduleRef.createNestApplication();
    app = nestApp;
    await nestApp.init();

    const response = await request(nestApp.getHttpServer()).get('/me').expect(200);

    expect(response.body.auth.externalAuthUserId).toBe('user_test_123');
    expect(response.body.user.externalAuthUserId).toBe('user_test_123');
    expect(response.body.user.currentPlan).toBe('FREE');
  });

  it('syncs a user without trusting client-supplied user id', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController, MeController],
      providers: [
        ClerkAuthGuard,
        ClerkAuthService,
        UsersService,
        {
          provide: UserRepository,
          useValue: createUserRepositoryStub(),
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useClass(TestAuthGuard)
      .compile();
    const nestApp = moduleRef.createNestApplication();
    app = nestApp;
    await nestApp.init();

    const response = await request(nestApp.getHttpServer())
      .post('/auth/sync-user')
      .send({ userId: 'malicious_client_user' })
      .expect(200);

    expect(response.body.user.externalAuthUserId).toBe('user_test_123');
    expect(response.body.user.externalAuthUserId).not.toBe('malicious_client_user');
  });
});

function createUserRepositoryStub() {
  const usersByExternalId = new Map<string, UserEntity>();

  return {
    findByExternalAuth: vi.fn(async (_provider: 'clerk', externalAuthUserId: string) => {
      return usersByExternalId.get(externalAuthUserId) ?? null;
    }),
    save: vi.fn(async (payload: Partial<UserEntity>) => {
      const existing = payload.externalAuthUserId
        ? usersByExternalId.get(payload.externalAuthUserId)
        : undefined;
      const now = new Date('2026-06-01T00:00:00.000Z');
      const user = {
        id: existing?.id ?? '11111111-1111-1111-1111-111111111111',
        externalAuthProvider: payload.externalAuthProvider ?? existing?.externalAuthProvider ?? 'clerk',
        externalAuthUserId: payload.externalAuthUserId ?? existing?.externalAuthUserId ?? 'user_test_123',
        email: payload.email ?? existing?.email ?? null,
        name: payload.name ?? existing?.name ?? null,
        avatarUrl: payload.avatarUrl ?? existing?.avatarUrl ?? null,
        currentPlan: payload.currentPlan ?? existing?.currentPlan ?? 'FREE',
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      } as UserEntity;
      usersByExternalId.set(user.externalAuthUserId, user);
      return user;
    }),
  };
}
