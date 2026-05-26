import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import { validate } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health/health.controller';
import { HospitalsModule } from './modules/hospitals/hospitals.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { UsersModule } from './modules/users/users.module';
import databaseConfig from './database/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, databaseConfig],
      validate,
    }),
    DatabaseModule,
    UsersModule,
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
