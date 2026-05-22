import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

import {
  ApiStandardErrorResponses,
  ApiWrappedCreatedResponse,
} from '../../../common/docs/swagger.common';
import { CreateReviewDto } from '../dto/create-review.dto';
import { ReviewResponseDto } from '../dto/review-response.dto';

export const CreateReviewSwagger = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Submit a hospital review',
      description:
        'Creates a review for a hospital. Requires a valid hospitalId. One review per user per hospital (mock user until auth).',
    }),
    ApiBody({
      type: CreateReviewDto,
      examples: {
        default: {
          summary: 'Sample review',
          value: {
            hospitalId: '1',
            rating: 5,
            comment: 'Excellent care and friendly staff.',
          },
        },
      },
    }),
    ApiWrappedCreatedResponse(
      ReviewResponseDto,
      'Review submitted successfully',
    ),
    ApiStandardErrorResponses(),
  );
