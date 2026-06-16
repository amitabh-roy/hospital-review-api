import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AccountDeletionRequestModel } from '../../database/models/account-deletion-request.model';
import { ContactSubmissionModel } from '../../database/models/contact-submission.model';
import { HospitalModel } from '../../database/models/hospital.model';
import { LoginEventModel } from '../../database/models/login-event.model';
import { ReviewReportModel } from '../../database/models/review-report.model';
import { ReviewModel } from '../../database/models/review.model';
import { RoleModel } from '../../database/models/role.model';
import { UnitModel } from '../../database/models/unit.model';
import { UserModel } from '../../database/models/user.model';
import { VerificationSubmissionModel } from '../../database/models/verification-submission.model';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    UsersModule,
    SequelizeModule.forFeature([
      UserModel,
      RoleModel,
      ReviewModel,
      HospitalModel,
      UnitModel,
      VerificationSubmissionModel,
      AccountDeletionRequestModel,
      ContactSubmissionModel,
      ReviewReportModel,
      LoginEventModel,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
