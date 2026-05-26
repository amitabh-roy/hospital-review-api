import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HospitalResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'CMS-1001' })
  cmsId: string;

  @ApiProperty({ example: 'City Hospital' })
  name: string;

  @ApiProperty({ example: 'New York' })
  city: string;

  @ApiProperty({ example: 'NY' })
  state: string;

  @ApiProperty({ example: 'General Acute Care' })
  facilityType: string;

  @ApiPropertyOptional({ example: 4.5 })
  averageRating?: number;
}
