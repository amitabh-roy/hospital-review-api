import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

import { REVIEW_STATUSES } from '../../../database/models/review.model';

export class AdminUpdateReviewStatusDto {
  @ApiProperty({
    example: 'approved',
    enum: REVIEW_STATUSES,
    description: 'New review status',
  })
  @IsString()
  @IsIn(REVIEW_STATUSES)
  status: (typeof REVIEW_STATUSES)[number];
}
