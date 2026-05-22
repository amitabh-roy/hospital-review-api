import { ApiProperty } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty({ example: '2' })
  id: string;

  @ApiProperty({ example: '1' })
  hospitalId: string;

  @ApiProperty({ example: 'user-mock-1' })
  userId: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  rating: number;

  @ApiProperty({ example: 'Excellent care and friendly staff.' })
  comment: string;

  @ApiProperty({ example: '2025-05-22T12:00:00.000Z' })
  createdAt: Date;
}
