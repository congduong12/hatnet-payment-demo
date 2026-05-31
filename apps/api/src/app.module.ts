import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller.js';
import { ClerkAuthService } from './auth/clerk-auth.service.js';
import { HealthController } from './health.controller.js';
import { MeController } from './users/me.controller.js';
import { UsersService } from './users/users.service.js';

@Module({
  controllers: [HealthController, AuthController, MeController],
  providers: [ClerkAuthService, UsersService],
})
export class AppModule {}
