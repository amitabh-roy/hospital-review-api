import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import type { AuthenticatedUser } from '../users/interfaces/authenticated-user.interface';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
}
