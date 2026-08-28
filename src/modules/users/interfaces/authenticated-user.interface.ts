import { UserVerificationStatus } from '../../../database/models/user.model';

export interface AuthenticatedUser {
  id: number;
  fullName: string;
  email: string;
  roleId: number;
  roleName: string;
  isVerified: boolean;
  verificationStatus: UserVerificationStatus;
  warningMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}
