import { Review } from '../interfaces/review.interface';

/** Temporary seed data — remove when ReviewsRepository + DB are added. */
export const REVIEWS_MOCK: Review[] = [
  {
    id: '1',
    hospitalId: '1',
    userId: 'user-mock-1',
    rating: 5,
    comment: 'Great hospital',
    createdAt: new Date('2025-01-15T10:00:00.000Z'),
  },
];
