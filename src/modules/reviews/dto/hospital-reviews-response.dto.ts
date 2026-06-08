import { ApiProperty } from '@nestjs/swagger';

import { PaginationMetaDto } from '../../../common/dto/pagination-meta.dto';
import { ReviewResponseDto } from './review-response.dto';

export class HospitalReviewsResponseDto {
  @ApiProperty({ type: [ReviewResponseDto] })
  items: ReviewResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination: PaginationMetaDto;
}
