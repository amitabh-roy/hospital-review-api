import { BadRequestException } from '@nestjs/common';

const MAX_SELFIE_AGE_MS = 10 * 60 * 1000;
const MIN_SELFIE_BYTES = 15_000;

/**
 * Server-side selfie liveness gate for MVP:
 * - rejects tiny/placeholder uploads
 * - requires a recent capture timestamp from the client camera flow
 */
export function assertSelfieLiveness(
  file: Express.Multer.File,
  captureTimestamp?: string,
): void {
  if (!file?.buffer?.length && !file?.size) {
    throw new BadRequestException('Selfie image is required.');
  }

  const size = file.size ?? file.buffer?.length ?? 0;

  if (size < MIN_SELFIE_BYTES) {
    throw new BadRequestException(
      'Selfie image appears invalid. Please capture a live photo using your camera.',
    );
  }

  if (!captureTimestamp?.trim()) {
    throw new BadRequestException(
      'Live selfie capture is required. Please use your device camera instead of uploading a saved photo.',
    );
  }

  const capturedAt = Date.parse(captureTimestamp);

  if (Number.isNaN(capturedAt)) {
    throw new BadRequestException('Invalid selfie capture timestamp.');
  }

  const ageMs = Date.now() - capturedAt;

  if (ageMs < 0 || ageMs > MAX_SELFIE_AGE_MS) {
    throw new BadRequestException(
      'Selfie capture expired. Please take a new live photo and submit again.',
    );
  }
}
