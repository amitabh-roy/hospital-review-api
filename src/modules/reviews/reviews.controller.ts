import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateReviewSwagger } from './docs/reviews.swagger';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

/** Review submission — one review per mock user per hospital until auth is added. */
@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /** POST /api/v1/reviews */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CreateReviewSwagger()
  create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.create(dto);
  }
}
