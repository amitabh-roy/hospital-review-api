import {
  Body,
  Controller,
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
import { AdminUpdateReviewStatusDto } from './dto/admin-update-review-status.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { ListHospitalReviewsQueryDto } from './dto/list-hospital-reviews-query.dto';
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

  @Get('hospital/:id')
  @GetHospitalReviewsSwagger()
  findByHospital(
    @Param('id', ParseIntPipe) hospitalId: number,
    @Query() query: ListHospitalReviewsQueryDto,
  ) {
    return this.reviewsService.findApprovedByHospital(hospitalId, query);
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
