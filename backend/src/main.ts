import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/index.js';
import { environmentConfig } from './config/environment.config.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  const logger = new Logger('Bootstrap');
  const config = environmentConfig();

  // Global prefix for all routes: /api/v1/...
  app.setGlobalPrefix('api/v1');

  // Enable CORS for frontend communication
  app.enableCors({
    origin: config.frontendUrl,
    credentials: true,
  });

  // Global validation pipe — enforces DTO validation on all incoming requests
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter — consistent error responses
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = config.port;
  await app.listen(port);
  logger.log(`🚀 SaudiNA API running on http://localhost:${port}/api/v1`);
}

void bootstrap();
