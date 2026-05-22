import { Test, TestingModule } from '@nestjs/testing';

import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

describe('ReviewsController', () => {
  let controller: ReviewsController;

  const reviewsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [{ provide: ReviewsService, useValue: reviewsService }],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
  });

  it('should delegate create to service', () => {
    const dto = { hospitalId: '2', rating: 4, comment: 'Nice' };
    reviewsService.create.mockReturnValue({ message: 'ok', data: {} });

    controller.create(dto);

    expect(reviewsService.create).toHaveBeenCalledWith(dto);
  });
});
