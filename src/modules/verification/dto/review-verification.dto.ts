import { IsIn, IsOptional, IsString } from 'class-validator';

import { VERIFICATION_SUBMISSION_STATUSES } from '../../../database/models/verification-submission.model';

export class ReviewVerificationDto {
  @IsIn([...VERIFICATION_SUBMISSION_STATUSES])
  status!: (typeof VERIFICATION_SUBMISSION_STATUSES)[number];

  @IsOptional()
  @IsString()
  adminNote?: string;
}
