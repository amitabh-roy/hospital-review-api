import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ControllerResponse } from '../../common/interfaces/controller-response.interface';
import { GetUnitsSwagger } from './docs/units.swagger';
import { UnitsListResponseDto } from './dto/units-list-response.dto';
import { UnitsService } from './units.service';

@ApiTags('Units')
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  @GetUnitsSwagger()
  findAll(): Promise<ControllerResponse<UnitsListResponseDto>> {
    return this.unitsService.findAll();
  }
}
