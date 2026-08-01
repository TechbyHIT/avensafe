type ClassValue = string | number | false | null | undefined;

/**
 * Joins class names, dropping falsy values. Kept dependency-free rather than
 * pulling in clsx for what amounts to a filter and a join.
 */
export function cn(...values: readonly ClassValue[]): string {
  return values.filter((value): value is string | number => Boolean(value)).join(' ');
}
