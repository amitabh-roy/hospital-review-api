import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ApiResponseDto } from '../common/dto/api-response.dto';

export const SWAGGER_PATH = 'api/docs';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Hospital Review API')
    .setDescription(
      'Hospital listings and reviews. All endpoints return a unified response envelope.',
    )
    .setVersion('1.0')
    .addTag('Health')
    .addTag('Hospitals')
    .addTag('Reviews')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [ApiResponseDto],
  });

  SwaggerModule.setup(SWAGGER_PATH, app, document);
}
