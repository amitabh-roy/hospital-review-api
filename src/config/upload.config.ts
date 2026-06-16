import { registerAs } from '@nestjs/config';
import * as path from 'path';

export default registerAs('upload', () => ({
  tempDir:
    process.env.UPLOAD_TEMP_DIR ?? path.join(process.cwd(), 'uploads', 'temp'),
  maxFileSizeBytes: Number(
    process.env.UPLOAD_MAX_FILE_SIZE ?? 10 * 1024 * 1024,
  ),
}));
