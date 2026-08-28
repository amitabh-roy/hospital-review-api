import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { API_RESPONSE } from './common/constants/api-response.constants';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { flattenValidationErrors } from './common/utils/validation-error.util';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  const corsOrigins = configService
    .get<string>('app.corsOrigin', 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          message: API_RESPONSE.VALIDATION_FAILED,
          errors: flattenValidationErrors(errors),
        }),
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  setupSwagger(app);

  const port = configService.get<number>('app.port', 3001);
  const host = configService.get<string>('app.host', '0.0.0.0');
  await app.listen(port, host);
}

void bootstrap().catch((error: unknown) => {
  console.error('Failed to start application', error);
  process.exit(1);
});
