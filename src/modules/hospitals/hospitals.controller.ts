import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ControllerResponse } from '../../common/interfaces/controller-response.interface';
import {
  GetHospitalByIdSwagger,
  GetHospitalSearchSwagger,
  GetHospitalsSwagger,
} from './docs/hospitals.swagger';
import { HospitalDetailResponseDto } from './dto/hospital-detail-response.dto';
import { HospitalsListResponseDto } from './dto/hospitals-list-response.dto';
import { ListHospitalsQueryDto } from './dto/list-hospitals-query.dto';
import { SearchHospitalsQueryDto } from './dto/search-hospitals-query.dto';
import { HospitalsService } from './hospitals.service';

@ApiTags('Hospitals')
@Controller('hospitals')
export class HospitalsController {
  constructor(private readonly hospitalsService: HospitalsService) {}

  @Get()
  @GetHospitalsSwagger()
  findAll(
    @Query() query: ListHospitalsQueryDto,
  ): Promise<ControllerResponse<HospitalsListResponseDto>> {
    return this.hospitalsService.findAll(query);
  }

  @Get('search')
  @GetHospitalSearchSwagger()
  searchHospitals(
    @Query() query: SearchHospitalsQueryDto,
  ): Promise<ControllerResponse<HospitalsListResponseDto>> {
    return this.hospitalsService.searchHospitals(query);
  }

  @Get(':id')
  @GetHospitalByIdSwagger()
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ControllerResponse<HospitalDetailResponseDto>> {
    return this.hospitalsService.findById(id);
  }
}
