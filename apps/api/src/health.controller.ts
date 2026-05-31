import { Controller, Get } from '@nestjs/common';

type HealthResponse = {
  status: 'ok';
  service: 'hatnet-api';
  timestamp: string;
};

@Controller('health')
export class HealthController {
  @Get()
  health(): HealthResponse {
    return {
      status: 'ok',
      service: 'hatnet-api',
      timestamp: new Date().toISOString(),
    };
  }
}
