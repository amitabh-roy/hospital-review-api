export function isInsecureJwtSecret(secret: string | undefined): boolean {
  if (!secret?.trim()) {
    return true;
  }

  const normalized = secret.trim().toLowerCase();

  if (normalized === 'change-me-in-production') {
    return true;
  }

  if (normalized.length < 32) {
    return true;
  }

  return (
    normalized.includes('changeme') ||
    normalized.includes('example') ||
    normalized.includes('default') ||
    normalized.includes('placeholder') ||
    (normalized.includes('secret') && normalized.includes('key'))
  );
}
