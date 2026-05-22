import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

import {
  ApiStandardErrorResponses,
  ApiWrappedOkResponse,
} from '../../../common/docs/swagger.common';
import { HospitalResponseDto } from '../dto/hospital-response.dto';

export const GetHospitalsSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'List hospitals',
      description: 'Returns all hospitals from in-memory mock data.',
    }),
    ApiWrappedOkResponse(
      HospitalResponseDto,
      'Hospitals fetched successfully',
      true,
    ),
    ApiStandardErrorResponses(),
  );

export const GetHospitalByIdSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get hospital by ID',
      description: 'Returns a single hospital or 404 if not found.',
    }),
    ApiParam({ name: 'id', example: '1', description: 'Hospital ID' }),
    ApiWrappedOkResponse(HospitalResponseDto, 'Hospital fetched successfully'),
    ApiStandardErrorResponses(),
  );
