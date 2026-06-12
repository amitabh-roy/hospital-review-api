export class AdminUserResponseDto {
  id!: number;
  fullName!: string;
  email!: string;
  roleId!: number;
  roleName!: string;
  isVerified!: boolean;
  verificationStatus!: string;
  reviewCount!: number;
  createdAt!: Date;
  updatedAt!: Date;
}
