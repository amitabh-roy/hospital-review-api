import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { UnitModel } from '../../database/models/unit.model';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';

@Module({
  imports: [SequelizeModule.forFeature([UnitModel])],
  controllers: [UnitsController],
  providers: [UnitsService],
  exports: [UnitsService],
})
export class UnitsModule {}
