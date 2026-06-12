import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../users/interfaces/authenticated-user.interface';
import { SavedHospitalsService } from './saved-hospitals.service';

@ApiTags('Saved Hospitals')
@Controller('saved-hospitals')
@UseGuards(JwtAuthGuard)
export class SavedHospitalsController {
  constructor(private readonly savedHospitalsService: SavedHospitalsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.savedHospitalsService.list(user);
  }

  @Post(':hospitalId')
  @HttpCode(HttpStatus.CREATED)
  save(
    @CurrentUser() user: AuthenticatedUser,
    @Param('hospitalId', ParseIntPipe) hospitalId: number,
  ) {
    return this.savedHospitalsService.save(user, hospitalId);
  }

  @Delete(':hospitalId')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('hospitalId', ParseIntPipe) hospitalId: number,
  ) {
    return this.savedHospitalsService.remove(user, hospitalId);
  }
}
