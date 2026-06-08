export function toHospitalSlug(name: string, id: number): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${base}-${id}`;
}

export function parseHospitalIdFromSlug(slug: string): number | null {
  const match = slug.match(/-(\d+)$/);

  if (!match) {
    return null;
  }

  const id = Number(match[1]);

  return Number.isInteger(id) && id > 0 ? id : null;
}
