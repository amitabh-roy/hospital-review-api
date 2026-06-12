export const VERIFICATION_RESPONSE = {
  SUBMITTED: 'Verification submitted successfully',
  FETCHED: 'Verification submissions fetched successfully',
  NOT_FOUND: 'Verification submission not found',
  ALREADY_PENDING: 'You already have a pending verification submission',
  ALREADY_VERIFIED: 'Your account is already verified',
  UPDATED: 'Verification decision recorded successfully',
  FILES_REQUIRED: 'Badge and identity files are required',
  INVALID_IDENTITY_METHOD: 'Identity method must be selfie or license',
} as const;
