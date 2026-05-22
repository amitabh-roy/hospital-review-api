import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

import { API_RESPONSE } from '../constants/api-response.constants';
import { ApiResponse } from '../interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { statusCode, message, errors } = this.resolveException(exception);

    const body: ApiResponse<null> = {
      status: false,
      statusCode,
      message,
      errors,
      data: null,
    };

    response.status(statusCode).json(body);
  }

  private resolveException(exception: unknown): {
    statusCode: number;
    message: string;
    errors: string[];
  } {
    if (!(exception instanceof HttpException)) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: API_RESPONSE.INTERNAL_ERROR,
        errors: [],
      };
    }

    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      return { statusCode, message: exceptionResponse, errors: [] };
    }

    if (typeof exceptionResponse !== 'object' || exceptionResponse === null) {
      return {
        statusCode,
        message: exception.message,
        errors: [],
      };
    }

    const body = exceptionResponse as Record<string, unknown>;
    const errors = this.extractErrors(body);
    const message = this.extractMessage(body, errors, statusCode);

    return { statusCode, message, errors };
  }

  private extractErrors(body: Record<string, unknown>): string[] {
    if (Array.isArray(body.errors)) {
      return body.errors.map(String);
    }

    if (Array.isArray(body.message)) {
      return body.message.map(String);
    }

    return [];
  }

  private extractMessage(
    body: Record<string, unknown>,
    errors: string[],
    statusCode: number,
  ): string {
    if (typeof body.message === 'string') {
      return body.message;
    }

    if (errors.length > 0) {
      if (statusCode === 400) {
        return API_RESPONSE.VALIDATION_FAILED;
      }

      return this.formatErrorValue(body.error, API_RESPONSE.VALIDATION_FAILED);
    }

    return this.formatErrorValue(body.error, 'Request failed');
  }

  private formatErrorValue(value: unknown, fallback: string): string {
    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    return fallback;
  }
}
