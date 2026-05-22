import { Module } from '@nestjs/common';

import { HospitalsModule } from '../hospitals/hospitals.module';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [HospitalsModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
