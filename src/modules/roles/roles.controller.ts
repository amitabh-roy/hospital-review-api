import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ControllerResponse } from '../../common/interfaces/controller-response.interface';
import { GetRolesSwagger } from './docs/roles.swagger';
import { RolesListResponseDto } from './dto/roles-list-response.dto';
import { RolesService } from './roles.service';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @GetRolesSwagger()
  findAll(): Promise<ControllerResponse<RolesListResponseDto>> {
    return this.rolesService.findAll();
  }
}
