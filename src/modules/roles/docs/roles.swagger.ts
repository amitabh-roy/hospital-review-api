import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import {
  ApiStandardErrorResponses,
  ApiWrappedOkResponse,
} from '../../../common/docs/swagger.common';
import { RolesListResponseDto } from '../dto/roles-list-response.dto';

export function GetRolesSwagger(): MethodDecorator {
  return applyDecorators(
    ApiOperation({
      summary: 'List healthcare roles',
      description:
        'Returns all signup/review roles from the database (excludes the admin role).',
    }),
    ApiWrappedOkResponse(RolesListResponseDto, 'Roles fetched successfully'),
    ApiStandardErrorResponses(),
  );
}
