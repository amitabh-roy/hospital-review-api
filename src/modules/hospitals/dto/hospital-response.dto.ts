import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HospitalResponseDto {
  @ApiProperty({ example: '1' })
  id: string;

  @ApiProperty({ example: 'City Hospital' })
  name: string;

  @ApiProperty({ example: 'New York' })
  city: string;

  @ApiProperty({ example: 'NY' })
  state: string;

  @ApiPropertyOptional({ example: 4.5 })
  averageRating?: number;
}
