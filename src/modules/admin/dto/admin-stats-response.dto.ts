export class AdminStatsResponseDto {
  totalUsers!: number;
  verifiedUsers!: number;
  pendingVerifications!: number;
  pendingReviews!: number;
  unreadMessages!: number;
  flaggedReviews!: number;
  flaggedAccounts!: number;
}
