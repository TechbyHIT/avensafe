import { SITEMAP_CONTENT_VERSION } from '@/config/constants';

const W3C_DATE = /^\d{4}-\d{2}-\d{2}$/u;

/** True when value is a W3C sitemap date (YYYY-MM-DD). */
export function isW3cDate(value: string): boolean {
  return W3C_DATE.test(value);
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function utcToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function todayIso(): string {
  return toIsoDate(utcToday());
}

function maxIsoDate(a: string, b: string): string {
  return a >= b ? a : b;
}

function minIsoDate(a: string, b: string): string {
  return a <= b ? a : b;
}

function notAfterToday(iso: string): string {
  return minIsoDate(iso, todayIso());
}

let memoizedCorpusLastmod: string | null = null;

/** Clears memoized corpus lastmod (tests / sitemap cache reset). */
export function resetCorpusLastmodCache(): void {
  memoizedCorpusLastmod = null;
}

/**
 * Shared lastmod for inventory URLs. Must stay cheap — counting 3M pages here
 * made `/sitemap.xml` too slow for Search Console and showed 0 discovered URLs.
 * Never in the future (GSC rejects future lastmod).
 */
export function corpusSitemapLastmod(): string {
  if (memoizedCorpusLastmod) return memoizedCorpusLastmod;
  memoizedCorpusLastmod = notAfterToday(
    isW3cDate(SITEMAP_CONTENT_VERSION) ? SITEMAP_CONTENT_VERSION : todayIso(),
  );
  return memoizedCorpusLastmod;
}

/** Prefer entity updatedAt when present; never older than corpus floor; never future. */
export function resolveSitemapLastmod(entityUpdatedAt?: string): string {
  const corpus = corpusSitemapLastmod();
  if (entityUpdatedAt && isW3cDate(entityUpdatedAt)) {
    return notAfterToday(maxIsoDate(entityUpdatedAt, corpus));
  }
  return corpus;
}

/** Inventory lastmod. Entity dates win for editorial URLs. */
export function sitemapLastmodForPath(_path: string, entityUpdatedAt?: string): string {
  return resolveSitemapLastmod(entityUpdatedAt);
}
