import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';

import {
  ApiStandardErrorResponses,
  ApiWrappedOkResponse,
} from '../../../common/docs/swagger.common';
import { HospitalDetailResponseDto } from '../dto/hospital-detail-response.dto';
import { HospitalsListResponseDto } from '../dto/hospitals-list-response.dto';

export const GetHospitalsSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'List hospitals',
      description:
        'Returns paginated hospitals with optional city/state/facility/rating filters.',
    }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 10 }),
    ApiQuery({ name: 'city', required: false, example: 'New York' }),
    ApiQuery({ name: 'state', required: false, example: 'NY' }),
    ApiQuery({
      name: 'facilityType',
      required: false,
      example: 'General Acute Care',
    }),
    ApiQuery({ name: 'minRating', required: false, example: 4 }),
    ApiQuery({ name: 'maxRating', required: false, example: 5 }),
    ApiWrappedOkResponse(
      HospitalsListResponseDto,
      'Hospitals fetched successfully',
    ),
    ApiStandardErrorResponses(),
  );

export function GetHospitalSearchSwagger(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'Search hospitals',
      description:
        'Searches hospitals by cmsId, name, city, state, or facility type with the same pagination and filter options as the list endpoint.',
    }),
    ApiQuery({ name: 'query', required: true, example: 'Boston' }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 10 }),
    ApiQuery({ name: 'city', required: false, example: 'Boston' }),
    ApiQuery({ name: 'state', required: false, example: 'MA' }),
    ApiQuery({
      name: 'facilityType',
      required: false,
      example: 'Teaching Hospital',
    }),
    ApiQuery({ name: 'minRating', required: false, example: 4 }),
    ApiQuery({ name: 'maxRating', required: false, example: 5 }),
    ApiWrappedOkResponse(
      HospitalsListResponseDto,
      'Hospital search results fetched successfully',
    ),
    ApiStandardErrorResponses(),
  );
}

export const GetHospitalByIdSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get hospital by ID',
      description:
        'Returns a single hospital with its mapped unit definitions and approved review count.',
    }),
    ApiParam({ name: 'id', example: 1, description: 'Hospital ID' }),
    ApiWrappedOkResponse(
      HospitalDetailResponseDto,
      'Hospital fetched successfully',
    ),
    ApiStandardErrorResponses(),
  );
