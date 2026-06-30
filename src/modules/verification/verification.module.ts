import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { RoleModel } from '../../database/models/role.model';
import { UserModel } from '../../database/models/user.model';
import { VerificationSubmissionModel } from '../../database/models/verification-submission.model';
import { UsersModule } from '../users/users.module';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';

@Module({
  imports: [
    UsersModule,
    SequelizeModule.forFeature([
      VerificationSubmissionModel,
      UserModel,
      RoleModel,
    ]),
  ],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
