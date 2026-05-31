import { INestApplication, CanActivate, ExecutionContext } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { AppModule } from '../app.module.js';
import { ClerkAuthGuard } from './clerk-auth.guard.js';
import type { AuthenticatedRequest } from './auth.types.js';

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
      imports: [AppModule],
    }).compile();
    const nestApp = moduleRef.createNestApplication();
    app = nestApp;
    await nestApp.init();

    await request(nestApp.getHttpServer()).get('/me').expect(401);
  });

  it('returns verified auth and synced internal user', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
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
      imports: [AppModule],
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
