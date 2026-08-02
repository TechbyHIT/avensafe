import { SITEMAP } from '@/config/constants';
import { STATIC_ROUTES, type SitemapType } from '@/config/routes';
import { getBlogPosts, getGuides, getImages } from '@/lib/data/repository';
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
  sliceAreaTargets,
  sliceServiceAreaIntentTargets,
  sliceServiceAreaTargets,
  sliceServiceCityIntentTargets,
} from '@/lib/routing/inventory';
import { absoluteUrl, blogPath, guidePath } from '@/lib/routing/url';
import {
  corpusSitemapLastmod,
  resetCorpusLastmodCache,
  resolveSitemapLastmod,
} from '@/lib/sitemap/lastmod';
import type { PageTarget } from '@/types/routing';

/**
 * The sitemap engine.
 *
 * - Index (`/sitemap.xml`) only enumerates child file names from counts.
 * - Each `/sitemaps/<name>.xml` builds one batch (≤ SITEMAP.batchSize URLs).
 * - URLs use the same path builders as canonicals.
 * - Every `<url>` has absolute HTTPS `<loc>` + `<lastmod>` (corpus fingerprint).
 * - Listed inventory URLs are indexable (structural gate only). Confirmed by
 *   `npm run validate:sitemap`.
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
  readonly slice: (offset: number, limit: number) => readonly PageTarget[];
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
  const lastModified = corpusSitemapLastmod();
  return dedupeUrls(
    targets.map((target) => ({
      loc: absoluteUrl(target.path),
      lastModified,
      priority: options.priority,
      ...(options.changeFrequency ? { changeFrequency: options.changeFrequency } : {}),
    })),
  );
}

function coreUrls(): readonly SitemapUrl[] {
  const lastModified = corpusSitemapLastmod();
  const paths: readonly { readonly path: string; readonly priority: number }[] = [
    { path: STATIC_ROUTES.home, priority: 1 },
    { path: STATIC_ROUTES.services, priority: 0.9 },
    { path: STATIC_ROUTES.serviceAreas, priority: 0.8 },
    { path: STATIC_ROUTES.about, priority: 0.6 },
    { path: STATIC_ROUTES.contact, priority: 0.7 },
    { path: STATIC_ROUTES.faq, priority: 0.6 },
    // Gallery lives only in the images sitemap (with image:image extensions).
    { path: STATIC_ROUTES.projects, priority: 0.6 },
    { path: STATIC_ROUTES.blog, priority: 0.6 },
    { path: STATIC_ROUTES.guides, priority: 0.7 },
    { path: STATIC_ROUTES.compare, priority: 0.65 },
  ];

  return dedupeUrls(
    paths.map((entry) => ({
      loc: absoluteUrl(entry.path),
      lastModified,
      priority: entry.priority,
      changeFrequency: 'monthly' as const,
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
      lastModified: corpusSitemapLastmod(),
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
    changeFrequency: 'monthly',
    list: listServiceTargets,
  },
  {
    type: 'service-intents',
    kind: 'light-targets',
    priority: 0.85,
    changeFrequency: 'monthly',
    list: listServiceIntentTargets,
  },
  {
    type: 'states',
    kind: 'light-targets',
    priority: 0.7,
    changeFrequency: 'monthly',
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
    priority: 0.7,
    changeFrequency: 'monthly',
    list: listCityTargets,
  },
  {
    type: 'areas',
    kind: 'heavy-targets',
    priority: 0.6,
    changeFrequency: 'monthly',
    count: countAreaTargets,
    slice: sliceAreaTargets,
  },
  {
    type: 'service-city',
    kind: 'light-targets',
    priority: 0.7,
    changeFrequency: 'monthly',
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
    count: countServiceAreaTargets,
    slice: sliceServiceAreaTargets,
  },
  {
    type: 'service-city-intent',
    kind: 'heavy-targets',
    priority: 0.65,
    changeFrequency: 'monthly',
    count: countServiceCityIntentTargets,
    slice: sliceServiceCityIntentTargets,
  },
  {
    type: 'service-area-intent',
    kind: 'heavy-targets',
    priority: 0.55,
    changeFrequency: 'monthly',
    count: countServiceAreaIntentTargets,
    slice: sliceServiceAreaIntentTargets,
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

let cachedIndexNames: readonly string[] | null = null;
let cachedIndexXml: string | null = null;
let cachedCorpusLastmod: string | null = null;
const fileCache = new Map<string, SitemapFile>();
const xmlCache = new Map<string, string>();

function corpusLastmodCached(): string {
  if (!cachedCorpusLastmod) cachedCorpusLastmod = corpusSitemapLastmod();
  return cachedCorpusLastmod;
}

/** Clears in-memory sitemap caches (tests or hot reload). */
export function resetSitemapCache(): void {
  cachedIndexNames = null;
  cachedIndexXml = null;
  cachedCorpusLastmod = null;
  resetCorpusLastmodCache();
  fileCache.clear();
  xmlCache.clear();
}

/** Cheap index listing from inventory counts (no URL materialization). */
export function listSitemapFileNames(): readonly string[] {
  if (cachedIndexNames) return cachedIndexNames;

  const names: string[] = [];
  for (const bucket of BUCKETS) {
    names.push(...batchNames(bucket.type, bucketCount(bucket)));
  }
  cachedIndexNames = names;
  return names;
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
    urls = urlsFromTargets(bucket.slice(offset, SITEMAP.batchSize), {
      priority: bucket.priority,
      changeFrequency: bucket.changeFrequency,
    });
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

/** Cached sitemap index XML. */
export function getSitemapIndexXml(): string {
  if (cachedIndexXml) return cachedIndexXml;
  cachedIndexXml = renderSitemapIndex(listSitemapFileNames());
  return cachedIndexXml;
}
