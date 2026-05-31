import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller.js';
import { ClerkAuthService } from './auth/clerk-auth.service.js';
import { DatabaseModule } from './database/database.module.js';
import { DatabaseHealthController } from './database/database-health.controller.js';
import { HealthController } from './health.controller.js';
import { MeController } from './users/me.controller.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [HealthController, DatabaseHealthController, AuthController, MeController],
  providers: [ClerkAuthService],
})
export class AppModule {}
