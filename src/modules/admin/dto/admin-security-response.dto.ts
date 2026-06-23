export class AdminSecurityPaginatedLoginsDto {
  items!: Array<{
    id: number;
    email: string;
    success: boolean;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
  }>;
  total!: number;
  page!: number;
  limit!: number;
}

export class AdminSecurityPaginatedEventsDto {
  items!: Array<{
    id: string;
    tone: 'ok' | 'warn';
    description: string;
    createdAt: Date;
  }>;
  total!: number;
  page!: number;
  limit!: number;
}

export class AdminSecurityResponseDto {
  adminProfile!: {
    email: string;
    fullName: string;
    updatedAt: Date;
  };
  recentLogins!: AdminSecurityPaginatedLoginsDto;
  platformEvents!: AdminSecurityPaginatedEventsDto;
}
