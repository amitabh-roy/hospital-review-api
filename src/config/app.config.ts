import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10', 10),
}));
