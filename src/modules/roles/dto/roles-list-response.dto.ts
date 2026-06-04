import { ApiProperty } from '@nestjs/swagger';

import { RoleOptionDto } from './role-option.dto';

export class RolesListResponseDto {
  @ApiProperty({ type: [RoleOptionDto] })
  items: RoleOptionDto[];
}
