import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
  GetHospitalByIdSwagger,
  GetHospitalsSwagger,
} from './docs/hospitals.swagger';
import { HospitalsService } from './hospitals.service';

/** Hospital listing routes — read-only until persistence layer is added. */
@ApiTags('Hospitals')
@Controller('hospitals')
export class HospitalsController {
  constructor(private readonly hospitalsService: HospitalsService) {}

  /** GET /api/v1/hospitals */
  @Get()
  @GetHospitalsSwagger()
  findAll() {
    return this.hospitalsService.findAll();
  }

  /** GET /api/v1/hospitals/:id */
  @Get(':id')
  @GetHospitalByIdSwagger()
  findOne(@Param('id') id: string) {
    return this.hospitalsService.findById(id);
  }
}
