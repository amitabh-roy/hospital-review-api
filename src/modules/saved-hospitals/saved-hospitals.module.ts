import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { HospitalModel } from '../../database/models/hospital.model';
import { ReviewModel } from '../../database/models/review.model';
import { SavedHospitalModel } from '../../database/models/saved-hospital.model';
import { SavedHospitalsController } from './saved-hospitals.controller';
import { SavedHospitalsService } from './saved-hospitals.service';

@Module({
  imports: [
    SequelizeModule.forFeature([SavedHospitalModel, HospitalModel, ReviewModel]),
  ],
  controllers: [SavedHospitalsController],
  providers: [SavedHospitalsService],
  exports: [SavedHospitalsService],
})
export class SavedHospitalsModule {}
