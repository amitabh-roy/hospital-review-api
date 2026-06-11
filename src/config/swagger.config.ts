import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ApiResponseDto } from '../common/dto/api-response.dto';

export const SWAGGER_PATH = 'api/docs';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Hospital Review API')
    .setDescription(
      'Hospital listings, reviews, and JWT auth. All endpoints return a unified response envelope.\n\n' +
        '**Using protected endpoints:**\n' +
        '1. Call `POST /api/v1/auth/login` (expand **Auth** → **login**).\n' +
        '2. Copy `data.accessToken` from the response (not `refreshToken`).\n' +
        '3. Click **Authorize** (lock icon, top right), paste the token only, then **Authorize** again.\n' +
        '4. Admin-only routes (e.g. `PATCH /reviews/{id}/status`) require the seeded admin account (`admin@example.com`) using the password from your local `SEED_DEV_PASSWORD`.',
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
          'JWT access token from POST /auth/login → response field `data.accessToken`. Paste the token only (do not include "Bearer ").',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [ApiResponseDto],
  });

  SwaggerModule.setup(SWAGGER_PATH, app, document);
}
