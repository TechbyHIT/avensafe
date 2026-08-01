/** Stable string hash for picking deterministic copy variants per page. */
export function hashString(input: string): number {
  let hash = 5381;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33) ^ input.charCodeAt(index);
  }
  return hash >>> 0;
}

export function pickVariant<T>(key: string, variants: readonly T[]): T {
  if (variants.length === 0) {
    throw new Error('pickVariant requires at least one variant');
  }
  return variants[hashString(key) % variants.length] as T;
}

/** Stable sort so long lists vary by page without changing on every build. */
export function orderDeterministic<T>(
  items: readonly T[],
  seed: string,
  keyOf: (item: T) => string,
): readonly T[] {
  return [...items].sort((left, right) => {
    const leftHash = hashString(`${seed}:${keyOf(left)}`);
    const rightHash = hashString(`${seed}:${keyOf(right)}`);
    return leftHash - rightHash || keyOf(left).localeCompare(keyOf(right));
  });
}
