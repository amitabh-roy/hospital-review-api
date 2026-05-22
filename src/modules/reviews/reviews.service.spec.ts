import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { HospitalsService } from '../hospitals/hospitals.service';
import { REVIEW_RESPONSE } from './constants/review.response';
import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  let service: ReviewsService;

  const hospitalsService = {
    exists: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: HospitalsService, useValue: hospitalsService },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    hospitalsService.exists.mockReset();
  });

  it('should create a review for a valid hospital', () => {
    hospitalsService.exists.mockReturnValue(true);

    const result = service.create({
      hospitalId: '2',
      rating: 4,
      comment: 'Good experience',
    });

    expect(result.message).toBe(REVIEW_RESPONSE.CREATED);
    expect(result.data.hospitalId).toBe('2');
    expect(result.data.rating).toBe(4);
  });

  it('should throw when hospital does not exist', () => {
    hospitalsService.exists.mockReturnValue(false);

    expect(() =>
      service.create({
        hospitalId: 'missing',
        rating: 5,
        comment: 'Test',
      }),
    ).toThrow(NotFoundException);
  });

  it('should reject duplicate review for same hospital and mock user', () => {
    hospitalsService.exists.mockReturnValue(true);

    expect(() =>
      service.create({
        hospitalId: '1',
        rating: 5,
        comment: 'Duplicate attempt',
      }),
    ).toThrow(BadRequestException);
  });
});
