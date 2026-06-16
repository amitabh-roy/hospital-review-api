import { IsIn, IsOptional, IsString } from 'class-validator';

import { ACCOUNT_DELETION_REQUEST_STATUSES } from '../../../database/models/account-deletion-request.model';

export class ReviewAccountDeletionDto {
  @IsIn(['approved', 'rejected'])
  status!: 'approved' | 'rejected';

  @IsOptional()
  @IsString()
  adminNote?: string;
}
