import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { MulterError } from 'multer';

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
    if (exception instanceof MulterError) {
      if (exception.code === 'LIMIT_FILE_SIZE') {
        return {
          statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
          message: 'Uploaded file is too large. Please use a smaller image.',
          errors: [],
        };
      }

      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Unable to process uploaded files.',
        errors: [],
      };
    }

    if (this.isPayloadTooLargeError(exception)) {
      return {
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        message: 'Upload is too large. Please use smaller images.',
        errors: [],
      };
    }

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

  private isPayloadTooLargeError(exception: unknown): boolean {
    if (!exception || typeof exception !== 'object') {
      return false;
    }

    const candidate = exception as {
      type?: string;
      status?: number;
      statusCode?: number;
      message?: string;
    };

    if (candidate.type === 'entity.too.large') {
      return true;
    }

    const status = candidate.status ?? candidate.statusCode;

    if (status === HttpStatus.PAYLOAD_TOO_LARGE) {
      return true;
    }

    return (
      typeof candidate.message === 'string' &&
      candidate.message.toLowerCase().includes('entity too large')
    );
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
