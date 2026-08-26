import { registerAs } from '@nestjs/config';

export default registerAs('upload', () => ({
  maxFileSizeBytes: Number(
    process.env.UPLOAD_MAX_FILE_SIZE ?? 30 * 1024 * 1024,
  ),
}));
