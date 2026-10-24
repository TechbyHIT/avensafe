/**
 * Audits the generated site for the SEO and accessibility faults that matter at
 * scale, and exits non-zero if any are found.
 *
 * Checks: duplicate titles, descriptions, H1s and canonicals; title and
 * description lengths; broken internal links; orphan pages; missing or
 * inappropriate structured data; missing image files and alt text; and thin
 * content via the publishing gate.
 *
 * The inventory runs to millions of pages, so the audit streams: each page is
 * checked as it is built and only compact per-page state (hashes, flags) is
 * retained. Issue messages are counted in full but only a sample is kept.
 *
 * Run with `npm run validate:seo`.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { business } from '../config/business';
import { SEO_LIMITS } from '../config/constants';
import { STATIC_ROUTES } from '../config/routes';
import { buildPageContent } from '../lib/content/engine';
import { getBlogPosts, getGuides, getImages, getServices, getStates } from '../lib/data/repository';
import { buildContextualLinks } from '../lib/links/engine';
import { listAllTargets } from '../lib/routing/inventory';
import { evaluatePublishing } from '../lib/routing/publishing';
import { buildCrumbs } from '../lib/routing/resolve';
import { absoluteUrl, blogPath, guidePath } from '../lib/routing/url';
import { buildPageCopy } from '../lib/seo/copy';
import { primaryKeywordFor } from '../lib/seo/page-seo';
import {
  breadcrumbSchema,
  faqPageSchema,
  serviceSchema,
  webPageSchema,
} from '../lib/schema/builders';
import { buildGraph } from '../lib/schema/graph';
import type { PageTarget } from '../types/routing';

class IssueLog {
  count = 0;
  readonly samples: string[] = [];

  constructor(private readonly limit: number) {}

  add(message: string): void {
    this.count += 1;
    if (this.samples.length < this.limit) this.samples.push(message);
  }
}

const errors = new IssueLog(200);
const warnings = new IssueLog(100);

/** 53-bit string hash (cyrb53); collisions are re-checked against the real values. */
function hash53(value: string): number {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < value.length; i += 1) {
    const ch = value.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

interface PageValues {
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly canonical: string;
}

type DuplicateField = keyof PageValues;

const DUPLICATE_LABELS: Record<DuplicateField, string> = {
  title: 'title',
  description: 'meta description',
  h1: 'H1',
  canonical: 'canonical URL',
};

/* ------------------------------------------------------------ build the audit */

const targets = listAllTargets();

const extraPaths = [
  ...Object.values(STATIC_ROUTES),
  ...getGuides().map((guide) => guidePath(guide)),
  ...getBlogPosts().map((post) => blogPath(post)),
];

/** Every known URL → a dense index, so per-page flags fit in typed arrays. */
const pathIndex = new Map<string, number>();
targets.forEach((target, index) => {
  if (!pathIndex.has(target.path)) pathIndex.set(target.path, index);
});
let nextIndex = targets.length;
for (const path of extraPaths) {
  if (!pathIndex.has(path)) pathIndex.set(path, nextIndex++);
}

const hasInbound = new Uint8Array(nextIndex);
const indexable = new Uint8Array(targets.length);

/** Per field: value hash → first indexable page index carrying it. */
const firstByHash = Object.fromEntries(
  (Object.keys(DUPLICATE_LABELS) as DuplicateField[]).map((field) => [field, new Map<number, number>()]),
) as Record<DuplicateField, Map<number, number>>;

/** Per field: first page index → every page path sharing its exact value. */
const duplicateGroups = Object.fromEntries(
  (Object.keys(DUPLICATE_LABELS) as DuplicateField[]).map((field) => [
    field,
    new Map<number, { value: string; paths: string[] }>(),
  ]),
) as Record<DuplicateField, Map<number, { value: string; paths: string[] }>>;

function pageValues(target: PageTarget): PageValues {
  const copy = buildPageCopy(target);
  return {
    title: copy.title,
    description: copy.description,
    h1: buildPageContent(target).h1,
    canonical: absoluteUrl(target.path),
  };
}

function trackDuplicates(index: number, values: PageValues): void {
  for (const field of Object.keys(DUPLICATE_LABELS) as DuplicateField[]) {
    const value = values[field].trim().toLowerCase();
    const key = hash53(value);
    const first = firstByHash[field].get(key);
    if (first === undefined) {
      firstByHash[field].set(key, index);
      continue;
    }

    let group = duplicateGroups[field].get(first);
    if (!group) {
      const firstValue = pageValues(targets[first]!)[field].trim().toLowerCase();
      if (firstValue !== value) continue;
      group = { value, paths: [targets[first]!.path] };
      duplicateGroups[field].set(first, group);
    }
    if (group.value === value) group.paths.push(targets[index]!.path);
  }
}

const started = Date.now();
const PROGRESS_EVERY = 250_000;

targets.forEach((target, index) => {
  const copy = buildPageCopy(target);
  const content = buildPageContent(target);
  const decision = evaluatePublishing(target, content);
  const linkGroups = buildContextualLinks(target);
  const crumbs = buildCrumbs(target);

  // Structured data must be present and appropriate for every generated page.
  const graph = buildGraph([
    webPageSchema({ name: copy.title, description: copy.description, path: target.path }),
    breadcrumbSchema(crumbs, target.path),
    target.service
      ? serviceSchema({
          service: target.service,
          path: target.path,
          description: copy.description,
          areaServed: [],
        })
      : undefined,
    faqPageSchema(content.faqs, target.path),
  ]);

  const types = new Set(graph['@graph'].map((node) => node['@type']));
  if (!types.has('WebPage')) errors.add(`${target.path}: no WebPage schema`);
  if (!types.has('BreadcrumbList')) errors.add(`${target.path}: no BreadcrumbList schema`);
  if (!types.has('Organization')) errors.add(`${target.path}: no Organization schema`);
  if (target.service && !types.has('Service')) {
    errors.add(`${target.path}: service page without Service schema`);
  }
  if (content.faqs.length > 0 && !types.has('FAQPage')) {
    errors.add(`${target.path}: renders FAQs but emits no FAQPage schema`);
  }
  if (content.faqs.length === 0 && types.has('FAQPage')) {
    errors.add(`${target.path}: emits FAQPage schema with no FAQs`);
  }

  // Structural faults → noindex. Soft content shortfalls are advisory only.
  if (!decision.indexable) {
    warnings.add(
      `${target.path}: not indexable — ${decision.reasons.join('; ')} (served noindex, follow)`,
    );
  } else if (decision.softReasons.length > 0) {
    warnings.add(`${target.path}: below advisory depth — ${decision.softReasons.join('; ')}`);
  }

  if (crumbs.length < 2) errors.add(`${target.path}: no breadcrumb trail`);

  /* ------------------------------------------ titles, descriptions, H1s */

  const values: PageValues = {
    title: copy.title,
    description: copy.description,
    h1: content.h1,
    canonical: absoluteUrl(target.path),
  };

  if (decision.indexable) {
    indexable[index] = 1;
    trackDuplicates(index, values);
  }

  if (values.title.length > SEO_LIMITS.titleMax) {
    errors.add(`${target.path}: title is ${values.title.length} chars (max ${SEO_LIMITS.titleMax})`);
  }
  if (values.title.length < SEO_LIMITS.titleMin) {
    errors.add(`${target.path}: title is only ${values.title.length} chars`);
  }
  if (values.description.length > SEO_LIMITS.descriptionMax) {
    errors.add(
      `${target.path}: description is ${values.description.length} chars (max ${SEO_LIMITS.descriptionMax})`,
    );
  }
  if (values.description.length < SEO_LIMITS.descriptionMin) {
    warnings.add(`${target.path}: description is only ${values.description.length} chars`);
  }
  if (values.h1.length > SEO_LIMITS.h1Max) {
    warnings.add(`${target.path}: H1 is ${values.h1.length} chars`);
  }
  if (!values.h1.trim()) errors.add(`${target.path}: missing H1`);

  const primaryKeyword = primaryKeywordFor(target);
  if (primaryKeyword.trim().length < 3) {
    errors.add(`${target.path}: primary keyword is missing`);
  }
  if (!values.canonical.startsWith(business.url)) {
    errors.add(`${target.path}: canonical ${values.canonical} is not on ${business.url}`);
  }
  if (values.canonical.includes('localhost') || values.canonical.includes('127.0.0.1')) {
    errors.add(`${target.path}: canonical uses an untrusted host`);
  }

  /* ---------------------------------------------------- internal links */

  for (const group of linkGroups) {
    for (const link of group.links) {
      const href = link.href;
      if (/^(https?:|tel:|mailto:|#)/u.test(href)) continue;
      const linked = pathIndex.get(href);
      if (linked === undefined) {
        errors.add(`${target.path}: links to "${href}", which is not a known page`);
        continue;
      }
      if (href === target.path) errors.add(`${target.path}: links to itself`);
      hasInbound[linked] = 1;
    }
  }

  if ((index + 1) % PROGRESS_EVERY === 0) {
    const seconds = Math.round((Date.now() - started) / 1000);
    console.log(`  … audited ${index + 1} / ${targets.length} pages (${seconds}s)`);
  }
});

for (const field of Object.keys(DUPLICATE_LABELS) as DuplicateField[]) {
  for (const { value, paths } of duplicateGroups[field].values()) {
    errors.add(
      `duplicate ${DUPLICATE_LABELS[field]} across ${paths.length} indexable pages: "${value}" — ${paths
        .slice(0, 4)
        .join(', ')}${paths.length > 4 ? ', …' : ''}`,
    );
  }
}

/* ------------------------------------------------------------------- orphans */

// Pages reachable from the header, footer or a hub page are linked by definition.
const navLinked = new Set<string>([
  ...Object.values(STATIC_ROUTES),
  ...getServices().map((service) => `/services/${service.slug}`),
  ...getStates().map((state) => `/${state.slug}`),
  ...getGuides().map((guide) => guidePath(guide)),
  ...getBlogPosts().map((post) => blogPath(post)),
]);

let orphanCount = 0;
const orphanSamples: string[] = [];
targets.forEach((target, index) => {
  if (!indexable[index] || navLinked.has(target.path)) return;
  if (hasInbound[pathIndex.get(target.path)!]) return;
  orphanCount += 1;
  if (orphanSamples.length < 6) orphanSamples.push(target.path);
});

if (orphanCount > 0) {
  errors.add(
    `${orphanCount} indexable page(s) have no inbound internal links: ${orphanSamples.join(', ')}${
      orphanCount > 6 ? ', …' : ''
    }`,
  );
}

/* -------------------------------------------------------------------- images */

for (const image of getImages()) {
  const file = join(process.cwd(), 'public', image.src.replace(/^\//u, ''));
  if (!existsSync(file)) {
    errors.add(`images.json[${image.id}]: file missing at public${image.src}`);
  }
  if (image.alt.trim().length === 0) {
    errors.add(`images.json[${image.id}]: empty alt text`);
  }
  if (image.placeholder) {
    warnings.add(`images.json[${image.id}]: still a generated placeholder`);
  }
}

/* ------------------------------------------------------------------ reporting */

const indexableCount = indexable.reduce((sum, flag) => sum + flag, 0);
console.log('\nSEO audit');
console.log(`  pages audited : ${targets.length}`);
console.log(`  indexable     : ${indexableCount}`);
console.log(`  noindex       : ${targets.length - indexableCount}`);
console.log(`  known URLs    : ${pathIndex.size}`);
console.log(`  duration      : ${Math.round((Date.now() - started) / 1000)}s`);

if (warnings.count > 0) {
  console.log(`\n${warnings.count} warning(s):`);
  for (const warning of warnings.samples.slice(0, 25)) console.log(`  • ${warning}`);
  if (warnings.count > 25) console.log(`  … and ${warnings.count - 25} more`);
}

if (errors.count > 0) {
  console.error(`\nSEO audit failed with ${errors.count} error(s):`);
  for (const error of errors.samples.slice(0, 40)) console.error(`  • ${error}`);
  if (errors.count > 40) console.error(`  … and ${errors.count - 40} more`);
  console.error('');
  process.exit(1);
}

console.log('\nSEO audit passed.\n');
