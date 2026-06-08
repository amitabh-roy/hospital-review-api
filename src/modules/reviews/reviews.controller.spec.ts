import { Test, TestingModule } from '@nestjs/testing';

import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

describe('ReviewsController', () => {
  let controller: ReviewsController;

  const reviewsService = {
    create: jest.fn(),
    findApprovedByHospital: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [{ provide: ReviewsService, useValue: reviewsService }],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
  });

  it('should delegate create to service', async () => {
    const dto = {
      hospitalId: 2,
      unitId: 1,
      rating: 4,
      comment: 'Nice',
      employmentType: 'full_time',
      shiftType: 'day',
    };
    const user = { id: 1, roleId: 1 };

    reviewsService.create.mockReturnValue({ message: 'ok', data: {} });

    await controller.create(dto, user as never);

    expect(reviewsService.create).toHaveBeenCalledWith(dto, user);
  });

  it('should delegate hospital review listing to service', async () => {
    const query = { page: 1, limit: 10 };

    reviewsService.findApprovedByHospital.mockReturnValue({
      message: 'ok',
      data: {},
    });

    await controller.findByHospital(1, query);

    expect(reviewsService.findApprovedByHospital).toHaveBeenCalledWith(
      1,
      query,
    );
  });
});
