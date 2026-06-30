import { registerAs } from '@nestjs/config';

export default registerAs('s3', () => ({
  region: process.env.AWS_REGION ?? 'us-east-1',
  bucket: process.env.AWS_S3_BUCKET ?? 'opencurtain-dev',
  keyPrefix: process.env.AWS_S3_KEY_PREFIX?.replace(/^\/+|\/+$/g, '') ?? '',
}));
