import { BadRequestException } from '@nestjs/common';

const BADGE_ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.pdf',
  '.heic',
  '.heif',
]);

const LICENSE_ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.heic',
  '.heif',
]);

const BADGE_ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/heif',
  'application/pdf',
]);

const LICENSE_ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/heif',
]);

function getExtension(filename: string): string {
  const dotIndex = filename.lastIndexOf('.');

  if (dotIndex < 0) {
    return '';
  }

  return filename.slice(dotIndex).toLowerCase();
}

function assertAllowedUpload(
  file: Express.Multer.File,
  allowedExtensions: Set<string>,
  allowedMimeTypes: Set<string>,
  message: string,
): void {
  const extension = getExtension(file.originalname ?? '');
  const mimeType = (file.mimetype ?? '').trim().toLowerCase();

  if (extension && allowedExtensions.has(extension)) {
    return;
  }

  if (mimeType && allowedMimeTypes.has(mimeType)) {
    return;
  }

  throw new BadRequestException(message);
}

export function assertVerificationBadgeFile(file: Express.Multer.File): void {
  assertAllowedUpload(
    file,
    BADGE_ALLOWED_EXTENSIONS,
    BADGE_ALLOWED_MIME_TYPES,
    'Badge file must be JPG, PNG, PDF, or HEIC.',
  );
}

export function assertVerificationLicenseFile(file: Express.Multer.File): void {
  assertAllowedUpload(
    file,
    LICENSE_ALLOWED_EXTENSIONS,
    LICENSE_ALLOWED_MIME_TYPES,
    'Identity file must be JPG, PNG, or HEIC.',
  );
}

export function assertVerificationSelfieFile(file: Express.Multer.File): void {
  const mimeType = (file.mimetype ?? '').trim().toLowerCase();

  if (mimeType !== 'image/jpeg') {
    throw new BadRequestException(
      'Selfie must be a live JPEG image from your camera.',
    );
  }
}
