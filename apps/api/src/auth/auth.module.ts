import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { ClerkAuthGuard } from './clerk-auth.guard.js';
import { ClerkAuthService } from './clerk-auth.service.js';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [ClerkAuthGuard, ClerkAuthService],
  exports: [ClerkAuthGuard, ClerkAuthService],
})
export class AuthModule {}
