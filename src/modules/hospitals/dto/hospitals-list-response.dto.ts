import { ApiProperty } from '@nestjs/swagger';

import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';
import { HospitalResponseDto } from './hospital-response.dto';

export class HospitalsListResponseDto {
  @ApiProperty({ type: [HospitalResponseDto] })
  items: HospitalResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination: PaginationMetaDto;
}
