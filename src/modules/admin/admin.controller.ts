import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Res,
  UseGuards,
  Body,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../users/interfaces/authenticated-user.interface';
import { ReviewAccountDeletionDto } from '../users/dto/review-account-deletion.dto';
import { UsersService } from '../users/users.service';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly usersService: UsersService,
  ) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  listUsers() {
    return this.adminService.listUsers();
  }

  @Get('flagged-accounts')
  listFlaggedAccounts() {
    return this.adminService.listFlaggedAccounts();
  }

  @Get('security')
  getSecurityActivity(@CurrentUser() user: AuthenticatedUser) {
    return this.adminService.getSecurityActivity(user);
  }

  @Get('export/reviews')
  async exportReviews(@Res() res: Response) {
    const csv = await this.adminService.exportReviewsCsv();

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="opencurtain-reviews.csv"',
    );
    res.send(csv);
  }

  @Get('account-deletion-requests')
  listAccountDeletionRequests() {
    return this.usersService.listPendingDeletionRequests();
  }

  @Patch('account-deletion-requests/:id')
  reviewAccountDeletionRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewAccountDeletionDto,
  ) {
    return this.usersService.reviewDeletionRequest(id, dto);
  }
}
