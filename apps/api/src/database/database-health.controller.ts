import { Controller, Get, Inject } from '@nestjs/common';
import { DatabaseHealthService } from './database-health.service.js';

@Controller('health/db')
export class DatabaseHealthController {
  constructor(@Inject(DatabaseHealthService) private readonly databaseHealthService: DatabaseHealthService) {}

  @Get()
  check() {
    return this.databaseHealthService.check();
  }
}
