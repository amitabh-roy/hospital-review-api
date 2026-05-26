import {
  BadRequestException,
  ConflictException,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  ForeignKeyConstraintError,
  UniqueConstraintError,
  ValidationError,
} from 'sequelize';

import { API_RESPONSE } from '../constants/api-response.constants';

interface DatabaseExceptionOptions {
  context: string;
  operation: string;
  uniqueConstraintMessage?: string;
  uniqueConstraintType?: 'badRequest' | 'conflict';
  badRequestMessage?: string;
}

export function handleDatabaseException(
  error: unknown,
  options: DatabaseExceptionOptions,
): never {
  if (error instanceof HttpException) {
    throw error;
  }

  const logger = new Logger(options.context);
  const stack = error instanceof Error ? error.stack : undefined;

  logger.error(`Database error during ${options.operation}`, stack);

  if (
    error instanceof UniqueConstraintError &&
    options.uniqueConstraintMessage
  ) {
    if (options.uniqueConstraintType === 'badRequest') {
      throw new BadRequestException(options.uniqueConstraintMessage);
    }

    throw new ConflictException(options.uniqueConstraintMessage);
  }

  if (
    (error instanceof ValidationError ||
      error instanceof ForeignKeyConstraintError) &&
    options.badRequestMessage
  ) {
    throw new BadRequestException(options.badRequestMessage);
  }

  throw new InternalServerErrorException(API_RESPONSE.INTERNAL_ERROR);
}
