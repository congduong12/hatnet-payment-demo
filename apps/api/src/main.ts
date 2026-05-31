import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { loadEnv } from './env.js';

async function bootstrap() {
  const env = loadEnv();
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.enableCors({
    origin: env.API_CORS_ORIGIN,
  });

  await app.listen(env.API_PORT);
}

void bootstrap();
