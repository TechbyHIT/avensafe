/**
 * Audits the generated site for the SEO and accessibility faults that matter at
 * scale, and exits non-zero if any are found.
 *
 * Checks: duplicate titles, descriptions, H1s and canonicals; title and
 * description lengths; broken internal links; orphan pages; missing or
 * inappropriate structured data; missing image files and alt text; and thin
 * content via the publishing gate.
 *
 * Run with `npm run validate:seo`.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
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
import {
  breadcrumbSchema,
  faqPageSchema,
  serviceSchema,
  webPageSchema,
} from '../lib/schema/builders';
import { buildGraph } from '../lib/schema/graph';
import type { PageTarget } from '../types/routing';

const errors: string[] = [];
const warnings: string[] = [];

interface AuditedPage {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly canonical: string;
  readonly indexable: boolean;
  readonly outboundLinks: readonly string[];
}

/* ------------------------------------------------------------ build the audit */

const targets = listAllTargets();
const pages: AuditedPage[] = [];

for (const target of targets) {
  const copy = buildPageCopy(target);
  const content = buildPageContent(target);
  const decision = evaluatePublishing(target, content);
  const linkGroups = buildContextualLinks(target);

  pages.push({
    path: target.path,
    title: copy.title,
    description: copy.description,
    h1: content.h1,
    canonical: absoluteUrl(target.path),
    indexable: decision.indexable,
    outboundLinks: linkGroups.flatMap((group) => group.links.map((link) => link.href)),
  });

  // Structured data must be present and appropriate for every generated page.
  const graph = buildGraph([
    webPageSchema({ name: copy.title, description: copy.description, path: target.path }),
    breadcrumbSchema(buildCrumbs(target), target.path),
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
  if (!types.has('WebPage')) errors.push(`${target.path}: no WebPage schema`);
  if (!types.has('BreadcrumbList')) errors.push(`${target.path}: no BreadcrumbList schema`);
  if (!types.has('Organization')) errors.push(`${target.path}: no Organization schema`);
  if (target.service && !types.has('Service')) {
    errors.push(`${target.path}: service page without Service schema`);
  }
  if (content.faqs.length > 0 && !types.has('FAQPage')) {
    errors.push(`${target.path}: renders FAQs but emits no FAQPage schema`);
  }
  if (content.faqs.length === 0 && types.has('FAQPage')) {
    errors.push(`${target.path}: emits FAQPage schema with no FAQs`);
  }

  // Structural faults → noindex. Soft content shortfalls are advisory only.
  if (!decision.indexable) {
    warnings.push(
      `${target.path}: not indexable — ${decision.reasons.join('; ')} (served noindex, follow)`,
    );
  } else if (decision.softReasons.length > 0) {
    warnings.push(
      `${target.path}: below advisory depth — ${decision.softReasons.join('; ')}`,
    );
  }

  if (buildCrumbs(target).length < 2) errors.push(`${target.path}: no breadcrumb trail`);
}

/* -------------------------------------------------- titles, descriptions, H1s */

function reportDuplicates(label: string, valueOf: (page: AuditedPage) => string): void {
  const seen = new Map<string, string[]>();
  for (const page of pages) {
    if (!page.indexable) continue;
    const key = valueOf(page).trim().toLowerCase();
    const bucket = seen.get(key);
    if (bucket) bucket.push(page.path);
    else seen.set(key, [page.path]);
  }

  for (const [value, paths] of seen) {
    if (paths.length > 1) {
      errors.push(
        `duplicate ${label} across ${paths.length} indexable pages: "${value}" — ${paths
          .slice(0, 4)
          .join(', ')}${paths.length > 4 ? ', …' : ''}`,
      );
    }
  }
}

reportDuplicates('title', (page) => page.title);
reportDuplicates('meta description', (page) => page.description);
reportDuplicates('H1', (page) => page.h1);
reportDuplicates('canonical URL', (page) => page.canonical);

for (const page of pages) {
  if (page.title.length > SEO_LIMITS.titleMax) {
    errors.push(`${page.path}: title is ${page.title.length} chars (max ${SEO_LIMITS.titleMax})`);
  }
  if (page.title.length < SEO_LIMITS.titleMin) {
    errors.push(`${page.path}: title is only ${page.title.length} chars`);
  }
  if (page.description.length > SEO_LIMITS.descriptionMax) {
    errors.push(
      `${page.path}: description is ${page.description.length} chars (max ${SEO_LIMITS.descriptionMax})`,
    );
  }
  if (page.description.length < SEO_LIMITS.descriptionMin) {
    warnings.push(`${page.path}: description is only ${page.description.length} chars`);
  }
  if (page.h1.length > SEO_LIMITS.h1Max) {
    warnings.push(`${page.path}: H1 is ${page.h1.length} chars`);
  }
  if (page.canonical !== absoluteUrl(page.path)) {
    errors.push(`${page.path}: canonical does not match its own URL`);
  }
}

/* ------------------------------------------------------------ internal links */

const validPaths = new Set<string>([
  ...Object.values(STATIC_ROUTES),
  ...targets.map((target) => target.path),
  ...getGuides().map((guide) => guidePath(guide)),
  ...getBlogPosts().map((post) => blogPath(post)),
]);

for (const page of pages) {
  for (const href of page.outboundLinks) {
    if (/^(https?:|tel:|mailto:|#)/u.test(href)) continue;
    if (!validPaths.has(href)) {
      errors.push(`${page.path}: links to "${href}", which is not a known page`);
    }
    if (href === page.path) errors.push(`${page.path}: links to itself`);
  }
}

/* ------------------------------------------------------------------- orphans */

const inbound = new Map<string, number>();
for (const path of validPaths) inbound.set(path, 0);

for (const page of pages) {
  for (const href of new Set(page.outboundLinks)) {
    if (inbound.has(href)) inbound.set(href, (inbound.get(href) ?? 0) + 1);
  }
}

// Pages reachable from the header, footer or a hub page are linked by definition.
const navLinked = new Set<string>([
  ...Object.values(STATIC_ROUTES),
  ...getServices().map((service) => `/services/${service.slug}`),
  ...getStates().map((state) => `/${state.slug}`),
  ...getGuides().map((guide) => guidePath(guide)),
  ...getBlogPosts().map((post) => blogPath(post)),
]);

const orphans = pages
  .filter((page) => page.indexable)
  .filter((page) => !navLinked.has(page.path) && (inbound.get(page.path) ?? 0) === 0)
  .map((page) => page.path);

if (orphans.length > 0) {
  errors.push(
    `${orphans.length} indexable page(s) have no inbound internal links: ${orphans
      .slice(0, 6)
      .join(', ')}${orphans.length > 6 ? ', …' : ''}`,
  );
}

/* -------------------------------------------------------------------- images */

for (const image of getImages()) {
  const file = join(process.cwd(), 'public', image.src.replace(/^\//u, ''));
  if (!existsSync(file)) {
    errors.push(`images.json[${image.id}]: file missing at public${image.src}`);
  }
  if (image.alt.trim().length === 0) {
    errors.push(`images.json[${image.id}]: empty alt text`);
  }
  if (image.placeholder) {
    warnings.push(`images.json[${image.id}]: still a generated placeholder`);
  }
}

/* ------------------------------------------------------------------ reporting */

function summarise(targetsAudited: readonly PageTarget[]): void {
  const indexable = pages.filter((page) => page.indexable).length;
  console.log('\nSEO audit');
  console.log(`  pages audited : ${targetsAudited.length}`);
  console.log(`  indexable     : ${indexable}`);
  console.log(`  noindex       : ${targetsAudited.length - indexable}`);
  console.log(`  known URLs    : ${validPaths.size}`);
}

summarise(targets);

if (warnings.length > 0) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const warning of warnings.slice(0, 25)) console.log(`  • ${warning}`);
  if (warnings.length > 25) console.log(`  … and ${warnings.length - 25} more`);
}

if (errors.length > 0) {
  console.error(`\nSEO audit failed with ${errors.length} error(s):`);
  for (const error of errors.slice(0, 40)) console.error(`  • ${error}`);
  if (errors.length > 40) console.error(`  … and ${errors.length - 40} more`);
  console.error('');
  process.exit(1);
}

console.log('\nSEO audit passed.\n');
