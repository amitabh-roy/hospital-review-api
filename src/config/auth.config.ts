import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET ?? 'hospital-reviews-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
}));
