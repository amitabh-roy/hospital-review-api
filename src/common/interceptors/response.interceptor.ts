import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { API_RESPONSE } from '../constants/api-response.constants';
import { ApiResponse } from '../interfaces/api-response.interface';
import { ControllerResponse } from '../interfaces/controller-response.interface';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((payload: unknown) => {
        if (this.isApiResponse(payload)) {
          return payload;
        }

        const controllerPayload = this.asControllerResponse(payload);

        const wrapped: ApiResponse<T> = {
          status: true,
          statusCode: response.statusCode ?? HttpStatus.OK,
          message: controllerPayload?.message ?? API_RESPONSE.DEFAULT_SUCCESS,
          errors: [],
          data: controllerPayload?.data ?? null,
        };

        return wrapped;
      }),
    );
  }

  private asControllerResponse(payload: unknown): ControllerResponse<T> | null {
    if (
      typeof payload !== 'object' ||
      payload === null ||
      !('message' in payload) ||
      !('data' in payload)
    ) {
      return null;
    }

    return payload as ControllerResponse<T>;
  }

  private isApiResponse(payload: unknown): payload is ApiResponse<T> {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      'status' in payload &&
      'statusCode' in payload &&
      'errors' in payload
    );
  }
}
