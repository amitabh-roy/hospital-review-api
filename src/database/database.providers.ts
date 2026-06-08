import { AuthTokenModel } from './models/auth-token.model';
import { HospitalModel } from './models/hospital.model';
import { HospitalUnitModel } from './models/hospital-unit.model';
import { RefreshTokenModel } from './models/refresh-token.model';
import { ReviewModel } from './models/review.model';
import { RoleModel } from './models/role.model';
import { UnitModel } from './models/unit.model';
import { UserModel } from './models/user.model';

export const databaseModels = [
  RoleModel,
  UserModel,
  RefreshTokenModel,
  AuthTokenModel,
  HospitalModel,
  UnitModel,
  HospitalUnitModel,
  ReviewModel,
] as const;
