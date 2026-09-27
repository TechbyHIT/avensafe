import { SITEMAP, SITEMAP_LONG_TAIL_TYPES, SITEMAP_PRIMARY_TYPES } from '@/config/constants';
import { STATIC_ROUTES, type SitemapType } from '@/config/routes';
import { getBlogPosts, getGuides, getImages } from '@/lib/data/repository';
import {
  listCityTargets,
  listDistrictTargets,
  listServiceCityTargets,
  listServiceDistrictTargets,
  listServiceIntentTargets,
  listServiceTargets,
  listStateTargets,
} from '@/lib/routing/inventory';
import { absoluteUrl, blogPath, guidePath } from '@/lib/routing/url';
import {
  corpusSitemapLastmod,
  resetCorpusLastmodCache,
  resolveSitemapLastmod,
  sitemapLastmodForPath,
} from '@/lib/sitemap/lastmod';
import {
  cachedCountAreaTargets,
  cachedCountServiceAreaIntentTargets,
  cachedCountServiceAreaTargets,
  cachedCountServiceCityIntentTargets,
  resetSitemapPathCache,
  sliceAreaPaths,
  sliceServiceAreaIntentPaths,
  sliceServiceAreaPaths,
  sliceServiceCityIntentPaths,
} from '@/lib/sitemap/paths';
import type { PageTarget } from '@/types/routing';

/**
 * The sitemap engine.
 *
 * Search Console counts `<url>` entries on the submitted file. An index has
 * none, so GSC showed 0 pages until every child was fetched (often never).
 *
 * Submit these urlsets (≤ 50,000 URLs — protocol max):
 * - `/sitemap.xml` — highest-value hubs / geo / service×place
 * - `/sitemap-long-tail.xml` — highest-value intent URLs
 *
 * Full coverage stays in `/sitemaps/<name>.xml`, listed from
 * `/sitemap-more.xml` and `/sitemap-intents.xml` (robots.txt).
 *
 * Locs match canonicals. Every `<url>` has https `<loc>` + `<lastmod>`.
 */

export interface SitemapImage {
  readonly loc: string;
  readonly caption?: string;
}

export interface SitemapUrl {
  readonly loc: string;
  /** W3C date YYYY-MM-DD — required on every entry. */
  readonly lastModified: string;
  readonly changeFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  readonly priority?: number;
  readonly images?: readonly SitemapImage[];
}

export interface SitemapFile {
  readonly name: string;
  readonly urls: readonly SitemapUrl[];
}

interface StaticBucket {
  readonly type: SitemapType;
  readonly kind: 'static';
  readonly urls: () => readonly SitemapUrl[];
}

interface LightTargetBucket {
  readonly type: SitemapType;
  readonly kind: 'light-targets';
  readonly priority: number;
  readonly changeFrequency: NonNullable<SitemapUrl['changeFrequency']>;
  readonly list: () => readonly PageTarget[];
}

interface HeavyTargetBucket {
  readonly type: SitemapType;
  readonly kind: 'heavy-targets';
  readonly priority: number;
  readonly changeFrequency: NonNullable<SitemapUrl['changeFrequency']>;
  readonly count: () => number;
  readonly slicePaths: (offset: number, limit: number) => readonly string[];
}

type Bucket = StaticBucket | LightTargetBucket | HeavyTargetBucket;

/** Drop duplicate locs within a batch (first wins). */
function dedupeUrls(urls: readonly SitemapUrl[]): readonly SitemapUrl[] {
  const seen = new Map<string, SitemapUrl>();
  for (const url of urls) {
    if (!seen.has(url.loc)) seen.set(url.loc, url);
  }
  return [...seen.values()];
}

function urlsFromTargets(
  targets: readonly PageTarget[],
  options: { readonly priority: number; readonly changeFrequency: SitemapUrl['changeFrequency'] },
): readonly SitemapUrl[] {
  return dedupeUrls(
    targets.map((target) => ({
      loc: absoluteUrl(target.path),
      lastModified: sitemapLastmodForPath(target.path),
      priority: options.priority,
      ...(options.changeFrequency ? { changeFrequency: options.changeFrequency } : {}),
    })),
  );
}

function coreUrls(): readonly SitemapUrl[] {
  const paths: readonly {
    readonly path: string;
    readonly priority: number;
    readonly changeFrequency: NonNullable<SitemapUrl['changeFrequency']>;
  }[] = [
    { path: STATIC_ROUTES.home, priority: 1, changeFrequency: 'weekly' },
    { path: STATIC_ROUTES.services, priority: 0.9, changeFrequency: 'weekly' },
    { path: STATIC_ROUTES.serviceAreas, priority: 0.8, changeFrequency: 'weekly' },
    { path: STATIC_ROUTES.contact, priority: 0.7, changeFrequency: 'monthly' },
    { path: STATIC_ROUTES.guides, priority: 0.7, changeFrequency: 'monthly' },
    { path: STATIC_ROUTES.compare, priority: 0.65, changeFrequency: 'monthly' },
    { path: STATIC_ROUTES.faq, priority: 0.6, changeFrequency: 'monthly' },
    { path: STATIC_ROUTES.about, priority: 0.6, changeFrequency: 'monthly' },
    { path: STATIC_ROUTES.projects, priority: 0.6, changeFrequency: 'monthly' },
    { path: STATIC_ROUTES.blog, priority: 0.6, changeFrequency: 'weekly' },
    // Gallery lives only in the images sitemap (image:image extensions).
  ];

  return dedupeUrls(
    paths.map((entry) => ({
      loc: absoluteUrl(entry.path),
      lastModified: sitemapLastmodForPath(entry.path),
      priority: entry.priority,
      changeFrequency: entry.changeFrequency,
    })),
  );
}

function guideUrls(): readonly SitemapUrl[] {
  return dedupeUrls(
    getGuides().map((guide) => ({
      loc: absoluteUrl(guidePath(guide)),
      lastModified: resolveSitemapLastmod(guide.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: guide.cornerstone ? 0.8 : 0.6,
    })),
  );
}

function blogUrls(): readonly SitemapUrl[] {
  return dedupeUrls(
    getBlogPosts().map((post) => ({
      loc: absoluteUrl(blogPath(post)),
      lastModified: resolveSitemapLastmod(post.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  );
}

function imageUrls(): readonly SitemapUrl[] {
  const images = getImages();
  if (images.length === 0) return [];
  return [
    {
      loc: absoluteUrl(STATIC_ROUTES.gallery),
      lastModified: sitemapLastmodForPath(STATIC_ROUTES.gallery),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
      images: images.map((image) => ({
        loc: absoluteUrl(image.src),
        ...(image.caption ? { caption: image.caption } : { caption: image.alt }),
      })),
    },
  ];
}

const BUCKETS: readonly Bucket[] = [
  { type: 'core', kind: 'static', urls: coreUrls },
  {
    type: 'services',
    kind: 'light-targets',
    priority: 0.9,
    changeFrequency: 'weekly',
    list: listServiceTargets,
  },
  {
    type: 'service-intents',
    kind: 'light-targets',
    priority: 0.85,
    changeFrequency: 'weekly',
    list: listServiceIntentTargets,
  },
  {
    type: 'states',
    kind: 'light-targets',
    priority: 0.75,
    changeFrequency: 'weekly',
    list: listStateTargets,
  },
  {
    type: 'districts',
    kind: 'light-targets',
    priority: 0.65,
    changeFrequency: 'monthly',
    list: listDistrictTargets,
  },
  {
    type: 'cities',
    kind: 'light-targets',
    priority: 0.8,
    changeFrequency: 'weekly',
    list: listCityTargets,
  },
  {
    type: 'areas',
    kind: 'heavy-targets',
    priority: 0.6,
    changeFrequency: 'monthly',
    count: cachedCountAreaTargets,
    slicePaths: sliceAreaPaths,
  },
  {
    type: 'service-city',
    kind: 'light-targets',
    priority: 0.75,
    changeFrequency: 'weekly',
    list: listServiceCityTargets,
  },
  {
    type: 'service-district',
    kind: 'light-targets',
    priority: 0.65,
    changeFrequency: 'monthly',
    list: listServiceDistrictTargets,
  },
  {
    type: 'service-area',
    kind: 'heavy-targets',
    priority: 0.6,
    changeFrequency: 'monthly',
    count: cachedCountServiceAreaTargets,
    slicePaths: sliceServiceAreaPaths,
  },
  {
    type: 'service-city-intent',
    kind: 'heavy-targets',
    priority: 0.5,
    changeFrequency: 'monthly',
    count: cachedCountServiceCityIntentTargets,
    slicePaths: sliceServiceCityIntentPaths,
  },
  {
    type: 'service-area-intent',
    kind: 'heavy-targets',
    priority: 0.4,
    changeFrequency: 'monthly',
    count: cachedCountServiceAreaIntentTargets,
    slicePaths: sliceServiceAreaIntentPaths,
  },
  { type: 'guides', kind: 'static', urls: guideUrls },
  { type: 'blog', kind: 'static', urls: blogUrls },
  { type: 'images', kind: 'static', urls: imageUrls },
];

function batchNames(type: string, count: number): readonly string[] {
  if (count <= 0) return [];
  const batches = Math.ceil(count / SITEMAP.batchSize);
  if (batches === 1) return [type];
  return Array.from({ length: batches }, (_, index) => `${type}-${index + 1}`);
}

function parseBatchName(name: string): { readonly type: string; readonly batchIndex: number } {
  const match = /^(.*)-(\d+)$/u.exec(name);
  if (match?.[1] && match[2]) {
    return { type: match[1], batchIndex: Number(match[2]) - 1 };
  }
  return { type: name, batchIndex: 0 };
}

function bucketCount(bucket: Bucket): number {
  if (bucket.kind === 'static') return bucket.urls().length;
  if (bucket.kind === 'light-targets') return bucket.list().length;
  return bucket.count();
}

const PRIMARY_TYPE_SET = new Set<string>(SITEMAP_PRIMARY_TYPES);
const LONG_TAIL_TYPE_SET = new Set<string>(SITEMAP_LONG_TAIL_TYPES);

let cachedAllNames: readonly string[] | null = null;
let cachedPrimaryNames: readonly string[] | null = null;
let cachedLongTailNames: readonly string[] | null = null;
let cachedIndexXml: string | null = null;
let cachedLongTailIndexXml: string | null = null;
let cachedPrimaryUrlsetXml: string | null = null;
let cachedLongTailUrlsetXml: string | null = null;
let cachedCorpusLastmod: string | null = null;
const fileCache = new Map<string, SitemapFile>();
const xmlCache = new Map<string, string>();

function corpusLastmodCached(): string {
  if (!cachedCorpusLastmod) cachedCorpusLastmod = corpusSitemapLastmod();
  return cachedCorpusLastmod;
}

function namesForTypes(allowed: ReadonlySet<string>): readonly string[] {
  const names: string[] = [];
  for (const bucket of BUCKETS) {
    if (!allowed.has(bucket.type)) continue;
    names.push(...batchNames(bucket.type, bucketCount(bucket)));
  }
  return names;
}

/** Clears in-memory sitemap caches (tests or hot reload). */
export function resetSitemapCache(): void {
  cachedAllNames = null;
  cachedPrimaryNames = null;
  cachedLongTailNames = null;
  cachedIndexXml = null;
  cachedLongTailIndexXml = null;
  cachedPrimaryUrlsetXml = null;
  cachedLongTailUrlsetXml = null;
  cachedCorpusLastmod = null;
  resetCorpusLastmodCache();
  resetSitemapPathCache();
  fileCache.clear();
  xmlCache.clear();
}

/** Child sitemap names in the primary index (`/sitemap.xml`). */
export function listPrimarySitemapFileNames(): readonly string[] {
  if (!cachedPrimaryNames) cachedPrimaryNames = namesForTypes(PRIMARY_TYPE_SET);
  return cachedPrimaryNames;
}

/** Child sitemap names in the long-tail index (`/sitemap-long-tail.xml`). */
export function listLongTailSitemapFileNames(): readonly string[] {
  if (!cachedLongTailNames) cachedLongTailNames = namesForTypes(LONG_TAIL_TYPE_SET);
  return cachedLongTailNames;
}

/** Every child sitemap file (primary + long-tail). */
export function listSitemapFileNames(): readonly string[] {
  if (!cachedAllNames) {
    cachedAllNames = [...listPrimarySitemapFileNames(), ...listLongTailSitemapFileNames()];
  }
  return cachedAllNames;
}

/** Builds one sitemap batch on demand. */
export function getSitemapFile(name: string): SitemapFile | undefined {
  const cached = fileCache.get(name);
  if (cached) return cached;

  const parsed = parseBatchName(name);
  const bucket = BUCKETS.find((entry) => entry.type === parsed.type);
  if (!bucket) return undefined;

  const total = bucketCount(bucket);
  const expected = batchNames(bucket.type, total);
  if (!expected.includes(name)) return undefined;

  const offset = parsed.batchIndex * SITEMAP.batchSize;
  let urls: readonly SitemapUrl[];

  if (bucket.kind === 'static') {
    urls = dedupeUrls(bucket.urls().slice(offset, offset + SITEMAP.batchSize));
  } else if (bucket.kind === 'light-targets') {
    urls = urlsFromTargets(bucket.list().slice(offset, offset + SITEMAP.batchSize), {
      priority: bucket.priority,
      changeFrequency: bucket.changeFrequency,
    });
  } else {
    const lastmod = corpusLastmodCached();
    urls = dedupeUrls(
      bucket.slicePaths(offset, SITEMAP.batchSize).map((path) => ({
        loc: absoluteUrl(path),
        lastModified: lastmod,
      })),
    );
  }

  if (urls.length === 0) return undefined;
  const file: SitemapFile = { name, urls };
  fileCache.set(name, file);
  return file;
}

/**
 * Materializes every file (expensive for long-tail). Prefer
 * `listSitemapFileNames` + `getSitemapFile` for a single batch.
 */
export function listSitemapFiles(): readonly SitemapFile[] {
  return listSitemapFileNames()
    .map((name) => getSitemapFile(name))
    .filter((file): file is SitemapFile => file !== undefined);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/gu, '&amp;')
    .replace(/</gu, '&lt;')
    .replace(/>/gu, '&gt;')
    .replace(/"/gu, '&quot;')
    .replace(/'/gu, '&apos;');
}

export function renderUrlset(file: SitemapFile): string {
  const urls = dedupeUrls(file.urls);
  const hasImages = urls.some((url) => url.images && url.images.length > 0);

  const body = urls
    .map((url) => {
      if (!url.lastModified) {
        throw new Error(`Sitemap URL missing lastmod: ${url.loc}`);
      }
      const parts = [
        `    <loc>${escapeXml(url.loc)}</loc>`,
        `    <lastmod>${escapeXml(url.lastModified)}</lastmod>`,
      ];
      if (url.changeFrequency) parts.push(`    <changefreq>${url.changeFrequency}</changefreq>`);
      if (url.priority !== undefined) {
        parts.push(`    <priority>${url.priority.toFixed(1)}</priority>`);
      }
      for (const image of url.images ?? []) {
        parts.push('    <image:image>');
        parts.push(`      <image:loc>${escapeXml(image.loc)}</image:loc>`);
        if (image.caption) {
          parts.push(`      <image:caption>${escapeXml(image.caption)}</image:caption>`);
        }
        parts.push('    </image:image>');
      }
      return `  <url>\n${parts.join('\n')}\n  </url>`;
    })
    .join('\n');

  const namespaces = [
    'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    hasImages ? 'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset ${namespaces}>\n${body}\n</urlset>\n`;
}

/** Cached XML for one child sitemap (fast for Googlebot retries). */
export function getSitemapXml(name: string): string | undefined {
  const hit = xmlCache.get(name);
  if (hit) return hit;
  const file = getSitemapFile(name);
  if (!file) return undefined;
  const xml = renderUrlset(file);
  xmlCache.set(name, xml);
  return xml;
}

export function renderSitemapIndex(fileNames: readonly string[]): string {
  const lastmod = corpusLastmodCached();
  const body = fileNames
    .map(
      (name) =>
        `  <sitemap>\n    <loc>${escapeXml(absoluteUrl(`/sitemaps/${name}.xml`))}</loc>\n    <lastmod>${escapeXml(lastmod)}</lastmod>\n  </sitemap>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

/** Primary sitemap index — hubs, geo, service×place, editorial. */
export function getSitemapIndexXml(): string {
  if (cachedIndexXml) return cachedIndexXml;
  cachedIndexXml = renderSitemapIndex(listPrimarySitemapFileNames());
  return cachedIndexXml;
}

/** Long-tail sitemap index — remaining intent batches (robots.txt). */
export function getLongTailSitemapIndexXml(): string {
  if (cachedLongTailIndexXml) return cachedLongTailIndexXml;
  cachedLongTailIndexXml = renderSitemapIndex(listLongTailSitemapFileNames());
  return cachedLongTailIndexXml;
}

function urlsFromPaths(paths: readonly string[], lastmod: string): readonly SitemapUrl[] {
  return paths.map((path) => ({
    loc: absoluteUrl(path),
    lastModified: lastmod,
  }));
}

function urlsFromBucket(bucket: Bucket, offset: number, limit: number): readonly SitemapUrl[] {
  if (limit <= 0) return [];
  if (bucket.kind === 'static') {
    return bucket.urls().slice(offset, offset + limit);
  }
  if (bucket.kind === 'light-targets') {
    return urlsFromTargets(bucket.list().slice(offset, offset + limit), {
      priority: bucket.priority,
      changeFrequency: bucket.changeFrequency,
    });
  }
  return urlsFromPaths(bucket.slicePaths(offset, limit), corpusLastmodCached());
}

function collectUrlset(types: readonly string[], max: number): readonly SitemapUrl[] {
  const collected: SitemapUrl[] = [];
  for (const type of types) {
    if (collected.length >= max) break;
    const bucket = BUCKETS.find((entry) => entry.type === type);
    if (!bucket) continue;
    collected.push(...urlsFromBucket(bucket, 0, max - collected.length));
  }
  return dedupeUrls(collected);
}

/**
 * Submitted `/sitemap.xml` — urlset so Search Console counts pages immediately.
 * Remaining primary URLs stay in `/sitemaps/*` via `/sitemap-more.xml`.
 */
export function getPrimaryUrlsetXml(): string {
  if (cachedPrimaryUrlsetXml) return cachedPrimaryUrlsetXml;
  const urls = collectUrlset(SITEMAP_PRIMARY_TYPES, SITEMAP.maxUrlsPerFile);
  cachedPrimaryUrlsetXml = renderUrlset({ name: 'primary', urls });
  return cachedPrimaryUrlsetXml;
}

/**
 * Submitted `/sitemap-long-tail.xml` — urlset of the first 50k intent URLs.
 * Remaining intent URLs stay in `/sitemaps/*` via `/sitemap-intents.xml`.
 */
export function getLongTailUrlsetXml(): string {
  if (cachedLongTailUrlsetXml) return cachedLongTailUrlsetXml;
  const urls = collectUrlset(SITEMAP_LONG_TAIL_TYPES, SITEMAP.maxUrlsPerFile);
  cachedLongTailUrlsetXml = renderUrlset({ name: 'long-tail', urls });
  return cachedLongTailUrlsetXml;
}
