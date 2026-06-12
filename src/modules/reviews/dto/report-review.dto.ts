import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

import { REVIEW_REPORT_REASONS } from '../../../database/models/review-report.model';

export class ReportReviewDto {
  @ApiProperty({
    example: 'individual',
    enum: REVIEW_REPORT_REASONS,
  })
  @IsString()
  @IsIn(REVIEW_REPORT_REASONS)
  reason: (typeof REVIEW_REPORT_REASONS)[number];
}
