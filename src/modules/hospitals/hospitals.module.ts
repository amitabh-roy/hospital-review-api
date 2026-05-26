import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { HospitalModel } from '../../database/models/hospital.model';
import { HospitalUnitModel } from '../../database/models/hospital-unit.model';
import { ReviewModel } from '../../database/models/review.model';
import { UnitModel } from '../../database/models/unit.model';

import { HospitalsController } from './hospitals.controller';
import { HospitalsService } from './hospitals.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      HospitalModel,
      HospitalUnitModel,
      UnitModel,
      ReviewModel,
    ]),
  ],
  controllers: [HospitalsController],
  providers: [HospitalsService],
  exports: [HospitalsService],
})
export class HospitalsModule {}
