import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ControllerResponse } from '../../common/interfaces/controller-response.interface';
import { HospitalsService } from '../hospitals/hospitals.service';
import { REVIEW_RESPONSE } from './constants/review.response';
import { REVIEWS_MOCK } from './data/reviews.mock';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './interfaces/review.interface';

/** Placeholder until JWT auth is added. */
const MOCK_USER_ID = 'user-mock-1';

/** In-memory review store — swap for a repository when Sequelize is integrated. */
@Injectable()
export class ReviewsService {
  private readonly reviews: Review[] = REVIEWS_MOCK.map((review) => ({
    ...review,
    createdAt: new Date(review.createdAt),
  }));

  constructor(private readonly hospitalsService: HospitalsService) {}

  create(dto: CreateReviewDto): ControllerResponse<Review> {
    if (!this.hospitalsService.exists(dto.hospitalId)) {
      throw new NotFoundException(REVIEW_RESPONSE.HOSPITAL_NOT_FOUND);
    }

    const duplicate = this.reviews.find(
      (review) =>
        review.hospitalId === dto.hospitalId && review.userId === MOCK_USER_ID,
    );

    if (duplicate) {
      throw new BadRequestException(REVIEW_RESPONSE.DUPLICATE_REVIEW);
    }

    const review: Review = {
      id: String(this.reviews.length + 1),
      hospitalId: dto.hospitalId,
      userId: MOCK_USER_ID,
      rating: dto.rating,
      comment: dto.comment,
      createdAt: new Date(),
    };

    this.reviews.push(review);

    return {
      message: REVIEW_RESPONSE.CREATED,
      data: review,
    };
  }
}
