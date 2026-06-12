import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  AdminUpdateReviewStatusSwagger,
  CreateReviewSwagger,
  GetHospitalReviewsSwagger,
  GetMyReviewsSwagger,
} from './docs/reviews.swagger';
import { AdminReviewFeedbackDto } from './dto/admin-review-feedback.dto';
import { AdminUpdateReviewStatusDto } from './dto/admin-update-review-status.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { ListHospitalReviewsQueryDto } from './dto/list-hospital-reviews-query.dto';
import { ReportReviewDto } from './dto/report-review.dto';
import { ResolveReviewReportDto } from './dto/resolve-review-report.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import type { AuthenticatedUser } from '../users/interfaces/authenticated-user.interface';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @CreateReviewSwagger()
  create(@Body() dto: CreateReviewDto, @CurrentUser() user: AuthenticatedUser) {
    return this.reviewsService.create(dto, user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @GetMyReviewsSwagger()
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.reviewsService.findByCurrentUser(user);
  }

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findForAdmin(@Query('status') status?: string) {
    const allowed = [
      'pending',
      'approved',
      'rejected',
      'needs_revision',
    ] as const;
    const normalized = allowed.find((value) => value === status);
    return this.reviewsService.findForAdmin(normalized);
  }

  @Get('admin/flagged')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findFlagged() {
    return this.reviewsService.findFlaggedReports();
  }

  @Patch('admin/reports/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  resolveReport(
    @Param('id', ParseIntPipe) reportId: number,
    @Body() dto: ResolveReviewReportDto,
  ) {
    return this.reviewsService.resolveReport(reportId, dto);
  }

  @Patch('admin/:id/feedback')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  sendFeedback(
    @Param('id', ParseIntPipe) reviewId: number,
    @Body() dto: AdminReviewFeedbackDto,
  ) {
    return this.reviewsService.sendAdminFeedback(reviewId, dto);
  }

  @Get('hospital/:id')
  @GetHospitalReviewsSwagger()
  findByHospital(
    @Param('id', ParseIntPipe) hospitalId: number,
    @Query() query: ListHospitalReviewsQueryDto,
  ) {
    return this.reviewsService.findApprovedByHospital(hospitalId, query);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateByOwner(
    @Param('id', ParseIntPipe) reviewId: number,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reviewsService.updateByOwner(reviewId, dto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteByOwner(
    @Param('id', ParseIntPipe) reviewId: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reviewsService.deleteByOwner(reviewId, user);
  }

  @Post(':id/report')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  reportReview(
    @Param('id', ParseIntPipe) reviewId: number,
    @Body() dto: ReportReviewDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reviewsService.reportReview(reviewId, dto, user);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @AdminUpdateReviewStatusSwagger()
  adminUpdateStatus(
    @Param('id', ParseIntPipe) reviewId: number,
    @Body() dto: AdminUpdateReviewStatusDto,
  ) {
    return this.reviewsService.adminUpdateStatus(reviewId, dto.status);
  }
}
