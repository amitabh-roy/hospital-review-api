import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty({ example: 2 })
  id: number;

  @ApiProperty({ example: 1 })
  hospitalId: number;

  @ApiPropertyOptional({ example: 'Jackson Memorial Hospital' })
  hospitalName?: string;

  @ApiProperty({
    example: 1,
    description: 'Reusable unit definition ID mapped to the reviewed hospital',
  })
  unitId: number;

  @ApiProperty({ example: 'ICU' })
  unitName: string;

  @ApiProperty({ example: 1 })
  roleId: number;

  @ApiProperty({ example: 'nurse' })
  roleName: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  rating: number;

  @ApiProperty({ example: 'Excellent care and friendly staff.' })
  comment: string;

  @ApiProperty({ example: 'full_time' })
  employmentType: string;

  @ApiProperty({ example: 'day' })
  shiftType: string;

  @ApiProperty({ example: 'approved' })
  status: string;

  @ApiProperty({ example: '2025-05-22T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-05-22T12:00:00.000Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ example: 43.5 })
  hourlyRate?: number | null;

  @ApiPropertyOptional({ example: '1 : 5' })
  patientRatio?: string | null;

  @ApiPropertyOptional({ example: 'Usually' })
  mealBreaks?: string | null;

  @ApiPropertyOptional({ example: 'Sometimes' })
  bathroomBreaks?: string | null;

  @ApiPropertyOptional({ example: '$150/mo' })
  parkingCost?: string | null;

  @ApiPropertyOptional({ example: 3.5 })
  managementRating?: number | null;

  @ApiPropertyOptional({ example: true })
  wouldReturn?: boolean | null;
}
