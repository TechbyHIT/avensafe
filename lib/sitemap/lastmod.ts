import { createHash } from 'node:crypto';
import { SITEMAP_CONTENT_VERSION, VARIATION_SEED } from '@/config/constants';
import {
  countAreaTargets,
  countServiceAreaIntentTargets,
  countServiceAreaTargets,
  countServiceCityIntentTargets,
  listCityTargets,
  listDistrictTargets,
  listServiceCityTargets,
  listServiceDistrictTargets,
  listServiceIntentTargets,
  listServiceTargets,
  listStateTargets,
} from '@/lib/routing/inventory';
import { getBlogPosts, getGuides } from '@/lib/data/repository';

const W3C_DATE = /^\d{4}-\d{2}-\d{2}$/u;

/** True when value is a W3C sitemap date (YYYY-MM-DD). */
export function isW3cDate(value: string): boolean {
  return W3C_DATE.test(value);
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function maxIsoDate(a: string, b: string): string {
  return a >= b ? a : b;
}

let memoizedCorpusLastmod: string | null = null;

/** Clears memoized corpus lastmod (tests / sitemap cache reset). */
export function resetCorpusLastmodCache(): void {
  memoizedCorpusLastmod = null;
}

/**
 * Corpus lastmod for inventory/core URLs.
 * Stable for a given content version + inventory shape; advances when either changes.
 */
export function corpusSitemapLastmod(): string {
  if (memoizedCorpusLastmod) return memoizedCorpusLastmod;

  const signal = [
    VARIATION_SEED,
    SITEMAP_CONTENT_VERSION,
    listServiceTargets().length,
    listServiceIntentTargets().length,
    listStateTargets().length,
    listDistrictTargets().length,
    listCityTargets().length,
    countAreaTargets(),
    listServiceCityTargets().length,
    listServiceDistrictTargets().length,
    countServiceAreaTargets(),
    countServiceCityIntentTargets(),
    countServiceAreaIntentTargets(),
    getGuides().length,
    getBlogPosts().length,
  ].join('|');

  const digest = createHash('sha256').update(signal).digest();
  const days = digest.readUInt32BE(0) % 5000;
  const fromHash = new Date(Date.UTC(2020, 0, 1 + days));
  const fromVersion = new Date(`${SITEMAP_CONTENT_VERSION}T00:00:00.000Z`);
  const chosen = fromHash.getTime() > fromVersion.getTime() ? fromHash : fromVersion;
  memoizedCorpusLastmod = toIsoDate(chosen);
  return memoizedCorpusLastmod;
}

/** Prefer entity updatedAt when present; never older than corpus floor. */
export function resolveSitemapLastmod(entityUpdatedAt?: string): string {
  const corpus = corpusSitemapLastmod();
  if (entityUpdatedAt && isW3cDate(entityUpdatedAt)) {
    return maxIsoDate(entityUpdatedAt, corpus);
  }
  return corpus;
}
