import { AuthTokenModel } from './models/auth-token.model';
import { ContactSubmissionModel } from './models/contact-submission.model';
import { HospitalModel } from './models/hospital.model';
import { HospitalUnitModel } from './models/hospital-unit.model';
import { RefreshTokenModel } from './models/refresh-token.model';
import { ReviewModel } from './models/review.model';
import { RoleModel } from './models/role.model';
import { UnitModel } from './models/unit.model';
import { UserModel } from './models/user.model';
import { VerificationSubmissionModel } from './models/verification-submission.model';

export const databaseModels = [
  RoleModel,
  UserModel,
  RefreshTokenModel,
  AuthTokenModel,
  HospitalModel,
  UnitModel,
  HospitalUnitModel,
  ReviewModel,
  VerificationSubmissionModel,
  ContactSubmissionModel,
] as const;
