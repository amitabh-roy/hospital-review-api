export function mostCommonValue(values: string[]): string {
  const counts = new Map<string, number>();

  for (const value of values) {
    const trimmed = value.trim();

    if (!trimmed) {
      continue;
    }

    counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
  }

  let winner = '';
  let highest = 0;

  for (const [value, count] of counts.entries()) {
    if (count > highest) {
      winner = value;
      highest = count;
    }
  }

  return winner;
}
