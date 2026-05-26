import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { ListHospitalsQueryDto } from './list-hospitals-query.dto';

export class SearchHospitalsQueryDto extends ListHospitalsQueryDto {
  @ApiProperty({
    example: 'city',
    description:
      'Free-text search against cmsId, name, city, state, and facilityType',
  })
  @IsString()
  @IsNotEmpty()
  query: string;
}
