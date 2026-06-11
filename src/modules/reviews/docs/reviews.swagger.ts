import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
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
import { AdminUpdateReviewStatusDto } from '../dto/admin-update-review-status.dto';
import { CreateReviewDto } from '../dto/create-review.dto';
import { HospitalReviewsResponseDto } from '../dto/hospital-reviews-response.dto';
import { ReviewResponseDto } from '../dto/review-response.dto';

export const CreateReviewSwagger = () =>
  applyDecorators(
    ApiBearerAuth('bearer'),
    ApiOperation({
      summary: 'Submit a hospital review',
      description:
        'Creates an approved review for an authenticated user. The userId and roleId are resolved from the JWT token, and the selected unit must be mapped to the selected hospital.',
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
            hourlyRate: 43.5,
            patientRatio: '5–6',
            mealBreaks: 'Usually',
            bathroomBreaks: 'Sometimes',
            parkingCost: '$150/mo',
            managementRating: 4,
            wouldReturn: true,
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

export const AdminUpdateReviewStatusSwagger = () =>
  applyDecorators(
    ApiBearerAuth('bearer'),
    ApiOperation({
      summary: 'Admin: approve or reject a review',
      description:
        'Updates review status (pending, approved, rejected). Requires an **admin** JWT — use **Authorize** (top right) after logging in via `POST /auth/login` with the seeded admin account and your local `SEED_DEV_PASSWORD`. Paste only the `accessToken` value from the login response `data` object.',
    }),
    ApiParam({
      name: 'id',
      example: 1,
      description: 'Review ID',
    }),
    ApiBody({
      type: AdminUpdateReviewStatusDto,
      examples: {
        approve: {
          summary: 'Approve review',
          value: { status: 'approved' },
        },
        reject: {
          summary: 'Reject review',
          value: { status: 'rejected' },
        },
      },
    }),
    ApiWrappedOkResponse(
      ReviewResponseDto,
      'Review status updated successfully',
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
    ApiForbiddenResponse({
      description: 'Authenticated user is not an admin',
      schema: {
        example: {
          status: false,
          statusCode: 403,
          message: 'Forbidden resource',
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
    ApiQuery({ name: 'roleId', required: false, example: 1 }),
    ApiQuery({ name: 'unitId', required: false, example: 1 }),
    ApiWrappedOkResponse(
      HospitalReviewsResponseDto,
      'Hospital reviews fetched successfully',
    ),
    ApiStandardErrorResponses(),
  );

export const GetMyReviewsSwagger = () =>
  applyDecorators(
    ApiBearerAuth('bearer'),
    ApiOperation({
      summary: 'List reviews submitted by the current user',
    }),
    ApiWrappedOkResponse(
      HospitalReviewsResponseDto,
      'Your reviews fetched successfully',
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
