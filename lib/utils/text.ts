/** Text helpers shared by the SEO, content and validation engines. */

/** "A", "A and B", "A, B and C" — used throughout body copy and descriptions. */
export function joinWithAnd(items: readonly string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0] ?? '';
  const head = items.slice(0, -1).join(', ');
  const tail = items[items.length - 1] ?? '';
  return `${head} and ${tail}`;
}

/** Counts words in prose, used by the thin-content gate. */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/u).length;
}

/**
 * Trims a description to fit a search snippet without cutting mid-word or
 * leaving dangling punctuation.
 */
export function truncateAtWord(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  // Reserve one character for the ellipsis so the result never exceeds maxLength.
  const budget = Math.max(1, maxLength - 1);
  const clipped = text.slice(0, budget);
  const lastSpace = clipped.lastIndexOf(' ');
  const base = lastSpace > budget * 0.6 ? clipped.slice(0, lastSpace) : clipped;
  return `${base.replace(/[\s,;:.\-—]+$/u, '')}…`;
}

/** Lowercases the first character, for embedding a phrase mid-sentence. */
export function lowerFirst(text: string): string {
  return text.length === 0 ? text : `${text.charAt(0).toLowerCase()}${text.slice(1)}`;
}

export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '');
}

/** Removes duplicates while preserving first-seen order. */
export function unique<T>(items: readonly T[]): readonly T[] {
  return [...new Set(items)];
}

/** Splits a list into fixed-size batches, used by the sitemap engine. */
export function chunk<T>(items: readonly T[], size: number): readonly (readonly T[])[] {
  if (size <= 0) throw new Error('chunk size must be greater than zero');
  const batches: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }
  return batches;
}
