import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { CurrentAuth } from '../auth/current-auth.decorator.js';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard.js';
import type { VerifiedAuth } from '../auth/auth.types.js';
import { UsersService } from './users.service.js';

@Controller('me')
export class MeController {
  constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(ClerkAuthGuard)
  me(@CurrentAuth() auth: VerifiedAuth) {
    return {
      auth: {
        externalAuthProvider: auth.externalAuthProvider,
        externalAuthUserId: auth.externalAuthUserId,
        sessionId: auth.sessionId,
      },
      user: this.usersService.syncFromAuth(auth),
    };
  }
}
