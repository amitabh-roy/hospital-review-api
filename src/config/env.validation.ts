import { plainToInstance } from 'class-transformer';
import {
  IsBooleanString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(65535)
  PORT?: number;

  @IsOptional()
  @IsEnum(Environment)
  NODE_ENV?: Environment;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  DB_HOST?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(65535)
  DB_PORT?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  DB_USER?: string;

  @IsOptional()
  @IsString()
  DB_PASSWORD?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  DB_NAME?: string;

  @IsOptional()
  @IsBooleanString()
  DB_LOGGING?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  JWT_SECRET?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  JWT_EXPIRES_IN?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_EXPIRES_IN?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  EMAIL_VERIFICATION_EXPIRES_IN?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  PASSWORD_RESET_EXPIRES_IN?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  APP_PUBLIC_URL?: string;

  @IsOptional()
  @IsNumber()
  @Min(4)
  @Max(15)
  BCRYPT_SALT_ROUNDS?: number;
}

const INSECURE_JWT_SECRETS = new Set([
  'change-me-in-production',
  'hospital-reviews-secret-key',
]);

export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: true });

  if (errors.length > 0) {
    const messages = errors.flatMap((error) =>
      Object.values(error.constraints ?? {}),
    );
    throw new Error(messages.join('; '));
  }

  const nodeEnv = validated.NODE_ENV ?? Environment.Development;
  const jwtSecret = validated.JWT_SECRET;

  if (nodeEnv === Environment.Production) {
    if (!jwtSecret || INSECURE_JWT_SECRETS.has(jwtSecret)) {
      throw new Error(
        'JWT_SECRET must be set to a strong unique value in production',
      );
    }
  }

  return validated;
}
