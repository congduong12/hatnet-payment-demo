import { Controller, HttpCode, Inject, Post, UseGuards } from '@nestjs/common';
import { CurrentAuth } from './current-auth.decorator.js';
import { ClerkAuthGuard } from './clerk-auth.guard.js';
import type { VerifiedAuth } from './auth.types.js';
import { UsersService } from '../users/users.service.js';

@Controller('auth')
export class AuthController {
  constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

  @Post('sync-user')
  @HttpCode(200)
  @UseGuards(ClerkAuthGuard)
  async syncUser(@CurrentAuth() auth: VerifiedAuth) {
    return {
      user: await this.usersService.syncFromAuth(auth),
    };
  }
}
