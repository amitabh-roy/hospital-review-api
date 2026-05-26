import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CreateReviewSwagger,
  GetHospitalReviewsSwagger,
} from './docs/reviews.swagger';
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

  @Get('hospital/:id')
  @GetHospitalReviewsSwagger()
  findByHospital(
    @Param('id', ParseIntPipe) hospitalId: number,
    @Query() query: ListHospitalReviewsQueryDto,
  ) {
    return this.reviewsService.findApprovedByHospital(hospitalId, query);
  }
}
