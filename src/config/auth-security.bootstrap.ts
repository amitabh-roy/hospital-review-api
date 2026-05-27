import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const INSECURE_JWT_SECRETS = new Set([
  'change-me-in-production',
  'hospital-reviews-secret-key',
]);

@Injectable()
export class AuthSecurityBootstrap implements OnModuleInit {
  private readonly logger = new Logger(AuthSecurityBootstrap.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const nodeEnv = this.configService.get<string>('app.nodeEnv', 'development');
    const jwtSecret = this.configService.get<string>('auth.jwtSecret');

    if (!jwtSecret || INSECURE_JWT_SECRETS.has(jwtSecret)) {
      const message =
        nodeEnv === 'production'
          ? 'JWT_SECRET must be set to a strong unique value in production.'
          : 'JWT_SECRET is unset or uses a default value. Set a strong secret before production.';

      if (nodeEnv === 'production') {
        throw new Error(message);
      }

      this.logger.warn(message);
    }

    if (nodeEnv !== 'production') {
      this.logger.warn(
        'Development seed users may use the known password Password@123. Never use seeded credentials in production.',
      );
    }
  }
}
