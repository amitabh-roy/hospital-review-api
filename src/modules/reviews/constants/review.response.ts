export const REVIEW_RESPONSE: Record<string, string> = {
  CREATED: 'Review submitted successfully',
  FETCH_BY_HOSPITAL: 'Hospital reviews fetched successfully',
  FETCH_MY_REVIEWS: 'Your reviews fetched successfully',
  FETCH_ADMIN_REVIEWS: 'Reviews fetched successfully',
  UPDATED: 'Review status updated successfully',
  HOSPITAL_NOT_FOUND: 'Hospital not found',
  UNIT_NOT_FOUND: 'Unit not found for the selected hospital',
  DUPLICATE_REVIEW: 'You have already reviewed this hospital',
  NOT_FOUND: 'Review not found',
  VERIFICATION_REQUIRED:
    'Credential verification is required before submitting a review',
  APPROVED: 'Review approved successfully',
  REJECTED: 'Review rejected successfully',
} as const;
