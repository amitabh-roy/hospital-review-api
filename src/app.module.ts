import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import appConfig from './config/app.config';
import { validate } from './config/env.validation';
import { HealthController } from './health/health.controller';
import { HospitalsModule } from './modules/hospitals/hospitals.module';
import { ReviewsModule } from './modules/reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validate,
    }),
    HospitalsModule,
    ReviewsModule,
  ],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware).forRoutes('{*path}');
  }
}
