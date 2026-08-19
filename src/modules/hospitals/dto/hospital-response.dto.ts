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

  @ApiProperty({ example: 'city-hospital-1' })
  slug: string;

  @ApiProperty({ example: 12 })
  approvedReviewCount: number;

  @ApiPropertyOptional({ example: '$44/hr' })
  avgRnPay?: string;

  @ApiPropertyOptional({ example: '1 : 5' })
  avgRatio?: string;

  @ApiPropertyOptional({ example: '72% get one' })
  mealBreaks?: string;

  @ApiPropertyOptional({ example: 'Free' })
  parking?: string;

  @ApiPropertyOptional({ example: '2023-01-01T00:00:00.000Z' })
  createdAt?: Date;
}
