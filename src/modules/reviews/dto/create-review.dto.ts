import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the hospital being reviewed',
  })
  @IsInt()
  @Min(1)
  hospitalId: number;

  @ApiProperty({
    example: 1,
    description:
      'Reusable unit definition ID mapped to the selected hospital',
  })
  @IsInt()
  @Min(1)
  unitId: number;

  @ApiProperty({
    example: 5,
    minimum: 1,
    maximum: 5,
    description: 'Rating from 1 (worst) to 5 (best)',
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: 'Excellent care and friendly staff.',
    description: 'Review comment text',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  comment: string;

  @ApiProperty({
    example: 'full_time',
    description: 'Employment arrangement for the reviewer',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  employmentType: string;

  @ApiProperty({
    example: 'day',
    description: 'Shift pattern for the reviewer',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  shiftType: string;
}
