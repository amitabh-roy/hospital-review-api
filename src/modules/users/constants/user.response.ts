export const USER_RESPONSE = {
  SIGNUP_SUCCESS: 'User signed up successfully',
  LOGIN_SUCCESS: 'User logged in successfully',
  PROFILE_FETCHED: 'Authenticated user fetched successfully',
  EMAIL_IN_USE: 'Email is already registered',
  INVALID_CREDENTIALS: 'Invalid email or password',
  ROLE_NOT_FOUND: 'Role not found',
  USER_NOT_FOUND: 'User not found',
  INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token',
  INVALID_OR_EXPIRED_TOKEN: 'Invalid or expired token',
  LOGOUT_SUCCESS: 'Logged out successfully',
  REFRESH_SUCCESS: 'Token refreshed successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
  VERIFICATION_EMAIL_SENT: 'Verification email sent if the account exists',
  PASSWORD_RESET_EMAIL_SENT: 'Password reset email sent if the account exists',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully',
  EMAIL_NOT_VERIFIED:
    'Credential verification is required before submitting reviews',
  ALREADY_VERIFIED: 'Email is already verified',
  VERIFICATION_UPDATED: 'User verification status updated',
  EMAIL_UPDATED: 'Email updated successfully',
  PASSWORD_UPDATED: 'Password updated successfully',
  NEW_PASSWORD_SAME_AS_CURRENT:
    'New password must be different from your current password.',
  ACCOUNT_DELETED: 'Account deleted successfully',
  ACCOUNT_DELETION_REQUESTED:
    'Account deletion request submitted for admin review',
  ACCOUNT_DELETION_ALREADY_PENDING:
    'You already have a pending account deletion request',
  ACCOUNT_DELETION_NOT_FOUND: 'Account deletion request not found',
  ACCOUNT_DELETION_UPDATED: 'Account deletion request updated',
  WRONG_PASSWORD: 'Password is incorrect',
  ACCOUNT_DEACTIVATED: 'This account has been deleted',
} as const;
