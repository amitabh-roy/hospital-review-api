import { mostCommonValue } from '../../../common/utils/review-stats.util';
import { ReviewModel } from '../../../database/models/review.model';

export type HospitalReviewStats = {
  avgRnPay: string;
  avgRatio: string;
  mealBreaks: string;
  parking: string;
};

const POSITIVE_MEAL_BREAKS = new Set(['Always', 'Usually']);

export function buildHospitalReviewStats(
  reviews: ReviewModel[],
): HospitalReviewStats {
  const rnReviews = reviews.filter(
    (review) =>
      review.role?.name?.includes('Registered Nurse') &&
      review.hourlyRate !== null &&
      review.hourlyRate !== undefined,
  );

  const ratioReviews = reviews.filter((review) => review.patientRatio?.trim());
  const mealReviews = reviews.filter((review) => review.mealBreaks?.trim());
  const parkingReviews = reviews.filter((review) => review.parkingCost?.trim());

  let avgRnPay = '—';

  if (rnReviews.length > 0) {
    const average =
      rnReviews.reduce((sum, review) => sum + Number(review.hourlyRate), 0) /
      rnReviews.length;

    avgRnPay = `$${average.toFixed(0)}/hr`;
  }

  let mealBreaks = 'Not reported';

  if (mealReviews.length > 0) {
    const positiveCount = mealReviews.filter((review) =>
      POSITIVE_MEAL_BREAKS.has(review.mealBreaks ?? ''),
    ).length;
    const percentage = Math.round((positiveCount / mealReviews.length) * 100);

    mealBreaks = `${percentage}% get one`;
  }

  return {
    avgRnPay,
    avgRatio: ratioReviews.length
      ? mostCommonValue(ratioReviews.map((review) => review.patientRatio ?? ''))
      : '—',
    mealBreaks,
    parking: parkingReviews.length
      ? mostCommonValue(
          parkingReviews.map((review) => review.parkingCost ?? ''),
        )
      : 'Not reported',
  };
}
