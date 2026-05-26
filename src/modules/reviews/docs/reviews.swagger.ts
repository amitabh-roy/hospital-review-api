import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import {
  ApiStandardErrorResponses,
  ApiWrappedCreatedResponse,
  ApiWrappedOkResponse,
} from '../../../common/docs/swagger.common';
import { CreateReviewDto } from '../dto/create-review.dto';
import { HospitalReviewsResponseDto } from '../dto/hospital-reviews-response.dto';
import { ReviewResponseDto } from '../dto/review-response.dto';

export const CreateReviewSwagger = () =>
  applyDecorators(
    ApiBearerAuth('bearer'),
    ApiOperation({
      summary: 'Submit a hospital review',
      description:
        'Creates a pending review for an authenticated user. The userId and roleId are resolved from the JWT token, and the selected unit must be mapped to the selected hospital.',
    }),
    ApiBody({
      type: CreateReviewDto,
      examples: {
        default: {
          summary: 'Sample review',
          value: {
            hospitalId: 1,
            unitId: 1,
            rating: 5,
            comment: 'Excellent care and friendly staff.',
            employmentType: 'full_time',
            shiftType: 'day',
          },
        },
      },
    }),
    ApiWrappedCreatedResponse(
      ReviewResponseDto,
      'Review submitted successfully',
    ),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid JWT token',
      schema: {
        example: {
          status: false,
          statusCode: 401,
          message: 'Unauthorized',
          errors: [],
          data: null,
        },
      },
    }),
    ApiStandardErrorResponses(),
  );

export const GetHospitalReviewsSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'List approved reviews for a hospital',
      description:
        'Returns approved reviews for a hospital with pagination metadata and resolved hospital-specific unit names.',
    }),
    ApiParam({ name: 'id', example: 1, description: 'Hospital ID' }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 10 }),
    ApiWrappedOkResponse(
      HospitalReviewsResponseDto,
      'Hospital reviews fetched successfully',
    ),
    ApiStandardErrorResponses(),
  );
