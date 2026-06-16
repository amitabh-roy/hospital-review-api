export class AccountDeletionRequestResponseDto {
  id!: number;
  userId!: number;
  userFullName?: string;
  userEmail?: string;
  reason!: string;
  status!: 'pending' | 'approved' | 'rejected';
  adminNote?: string | null;
  reviewedAt?: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
}
