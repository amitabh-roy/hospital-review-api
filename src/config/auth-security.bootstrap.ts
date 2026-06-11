import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { isInsecureJwtSecret } from './insecure-jwt-secret.util';

@Injectable()
export class AuthSecurityBootstrap implements OnModuleInit {
  private readonly logger = new Logger(AuthSecurityBootstrap.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const nodeEnv = this.configService.get<string>(
      'app.nodeEnv',
      'development',
    );
    const jwtSecret = this.configService.get<string>('auth.jwtSecret');

    if (isInsecureJwtSecret(jwtSecret)) {
      const message =
        nodeEnv === 'production'
          ? 'JWT_SECRET must be set to a strong unique value in production.'
          : 'JWT_SECRET is unset or uses a weak value. Set a strong secret before production.';

      if (nodeEnv === 'production') {
        throw new Error(message);
      }

      this.logger.warn(message);
    }

    if (nodeEnv !== 'production') {
      this.logger.warn(
        'Development seed users use SEED_DEV_PASSWORD from your local .env. Never use seeded credentials in production.',
      );
    }
  }
}
