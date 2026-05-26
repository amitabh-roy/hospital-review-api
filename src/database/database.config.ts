import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  dialect: 'postgres' as const,
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'password',
  database: process.env.DB_NAME ?? 'hospital_reviews',
  logging: process.env.DB_LOGGING === 'true',
}));
