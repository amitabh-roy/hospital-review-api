import type { IdentityMethod } from '../../../database/models/verification-submission.model';
import type { VerificationSubmissionStatus } from '../../../database/models/verification-submission.model';

export class VerificationSubmissionResponseDto {
  id!: number;
  userId!: number;
  userFullName?: string;
  userEmail?: string;
  userRoleName?: string;
  identityMethod!: IdentityMethod;
  status!: VerificationSubmissionStatus;
  hasBadgeImage!: boolean;
  hasIdentityImage!: boolean;
  adminNote!: string | null;
  reviewedAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
}
