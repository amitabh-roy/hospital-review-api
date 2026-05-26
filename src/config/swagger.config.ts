import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ApiResponseDto } from '../common/dto/api-response.dto';

export const SWAGGER_PATH = 'api/docs';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Hospital Review API')
    .setDescription(
      'Hospital listings, reviews, and JWT auth. All endpoints return a unified response envelope.',
    )
    .setVersion('1.0')
    .addTag('Health')
    .addTag('Auth')
    .addTag('Hospitals')
    .addTag('Reviews')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Paste the JWT access token received from /auth/signup or /auth/login.',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [ApiResponseDto],
  });

  SwaggerModule.setup(SWAGGER_PATH, app, document);
}
