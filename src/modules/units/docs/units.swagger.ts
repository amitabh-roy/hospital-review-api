import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import {
  ApiStandardErrorResponses,
  ApiWrappedOkResponse,
} from '../../../common/docs/swagger.common';
import { UnitsListResponseDto } from '../dto/units-list-response.dto';

export function GetUnitsSwagger(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'List care units / departments',
      description:
        'Returns all unit definitions used for hospital mapping and review filters.',
    }),
    ApiWrappedOkResponse(UnitsListResponseDto, 'Units fetched successfully'),
    ApiStandardErrorResponses(),
  );
}
