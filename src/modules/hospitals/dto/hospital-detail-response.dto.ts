import { ApiProperty } from '@nestjs/swagger';

import { HospitalResponseDto } from './hospital-response.dto';
import { UnitResponseDto } from './unit-response.dto';

export class HospitalDetailResponseDto extends HospitalResponseDto {
  @ApiProperty({ type: [UnitResponseDto] })
  units: UnitResponseDto[];
}
