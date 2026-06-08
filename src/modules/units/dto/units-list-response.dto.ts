import { ApiProperty } from '@nestjs/swagger';

import { UnitOptionDto } from './unit-option.dto';

export class UnitsListResponseDto {
  @ApiProperty({ type: [UnitOptionDto] })
  items: UnitOptionDto[];
}
