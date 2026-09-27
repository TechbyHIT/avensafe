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
 * Corpus lastmod for inventory/core URLs.
 * Stable for a given content version + inventory shape; never in the future
 * (Search Console rejects future lastmod).
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
  const today = utcToday();
  const candidates = [fromHash, fromVersion].filter((date) => date.getTime() <= today.getTime());
  const chosen = candidates.reduce(
    (latest, date) => (date.getTime() > latest.getTime() ? date : latest),
    candidates[0] ?? today,
  );
  memoizedCorpusLastmod = toIsoDate(chosen);
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

/**
 * Stable per-URL lastmod so sibling pages do not all share one timestamp
 * (a common Search Console “doorway / generated farm” signal).
 */
export function sitemapLastmodForPath(path: string, entityUpdatedAt?: string): string {
  if (entityUpdatedAt && isW3cDate(entityUpdatedAt)) {
    return resolveSitemapLastmod(entityUpdatedAt);
  }

  const corpus = corpusSitemapLastmod();
  const floor = Date.UTC(2024, 0, 1);
  const ceiling = new Date(`${corpus}T00:00:00.000Z`).getTime();
  const spanDays = Math.max(1, Math.floor((ceiling - floor) / 86_400_000));
  const digest = createHash('sha256')
    .update(`${VARIATION_SEED}|${SITEMAP_CONTENT_VERSION}|${path}`)
    .digest();
  const offset = digest.readUInt32BE(0) % (spanDays + 1);
  return notAfterToday(toIsoDate(new Date(floor + offset * 86_400_000)));
}
