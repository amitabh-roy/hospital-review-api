import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { VerifiedUserGuard } from '../../common/guards/verified-user.guard';
import { HospitalModel } from '../../database/models/hospital.model';
import { HospitalUnitModel } from '../../database/models/hospital-unit.model';
import { ReviewModel } from '../../database/models/review.model';
import { RoleModel } from '../../database/models/role.model';
import { UnitModel } from '../../database/models/unit.model';
import { UserModel } from '../../database/models/user.model';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ReviewModel,
      HospitalModel,
      HospitalUnitModel,
      UnitModel,
      UserModel,
      RoleModel,
    ]),
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, JwtAuthGuard, VerifiedUserGuard],
})
export class ReviewsModule {}
