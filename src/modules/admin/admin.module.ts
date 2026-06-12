import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ContactSubmissionModel } from '../../database/models/contact-submission.model';
import { ReviewModel } from '../../database/models/review.model';
import { RoleModel } from '../../database/models/role.model';
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
      VerificationSubmissionModel,
      ContactSubmissionModel,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
