import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import { REVIEW_REPORT_STATUSES } from '../../../database/models/review-report.model';

export class ResolveReviewReportDto {
  @ApiProperty({ example: 'resolved', enum: ['resolved', 'dismissed'] })
  @IsString()
  @IsIn(['resolved', 'dismissed'])
  status: 'resolved' | 'dismissed';

  @ApiPropertyOptional({ example: 'Review hidden pending author revision.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  adminNotes?: string;
}
