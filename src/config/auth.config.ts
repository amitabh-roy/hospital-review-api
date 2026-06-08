import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  emailVerificationExpiresIn:
    process.env.EMAIL_VERIFICATION_EXPIRES_IN ?? '24h',
  passwordResetExpiresIn: process.env.PASSWORD_RESET_EXPIRES_IN ?? '1h',
  appPublicUrl: process.env.APP_PUBLIC_URL ?? 'http://localhost:3000',
}));
