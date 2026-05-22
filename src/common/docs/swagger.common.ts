import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  getSchemaPath,
} from '@nestjs/swagger';

import { ApiResponseDto } from '../dto/api-response.dto';

const wrappedSchema = <TModel extends Type<unknown>>(
  model: TModel,
  isArray = false,
) => ({
  allOf: [
    { $ref: getSchemaPath(ApiResponseDto) },
    {
      properties: {
        data: isArray
          ? { type: 'array', items: { $ref: getSchemaPath(model) } }
          : { $ref: getSchemaPath(model) },
      },
    },
  ],
});

export const ApiWrappedOkResponse = <TModel extends Type<unknown>>(
  model: TModel,
  description: string,
  isArray = false,
) =>
  applyDecorators(
    ApiExtraModels(ApiResponseDto, model),
    ApiOkResponse({
      description,
      schema: wrappedSchema(model, isArray),
    }),
  );

export const ApiWrappedCreatedResponse = <TModel extends Type<unknown>>(
  model: TModel,
  description: string,
) =>
  applyDecorators(
    ApiExtraModels(ApiResponseDto, model),
    ApiCreatedResponse({
      description,
      schema: wrappedSchema(model),
    }),
  );

export const ApiStandardErrorResponses = () =>
  applyDecorators(
    ApiBadRequestResponse({
      description: 'Validation or bad request',
      schema: {
        example: {
          status: false,
          statusCode: 400,
          message: 'Validation failed',
          errors: ['hospitalId: hospitalId must be a string'],
          data: null,
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'Resource not found',
      schema: {
        example: {
          status: false,
          statusCode: 404,
          message: 'Hospital not found',
          errors: [],
          data: null,
        },
      },
    }),
    ApiInternalServerErrorResponse({
      description: 'Unexpected server error',
      schema: {
        example: {
          status: false,
          statusCode: 500,
          message: 'Internal server error',
          errors: [],
          data: null,
        },
      },
    }),
  );
