/**
 * Asserts sitemap policy for production indexing:
 * - Every inventory URL is indexable and robots-allowed
 * - Index syncs with listSitemapFileNames()
 * - Sampled child sitemaps are valid XML with https loc + lastmod
 * - No duplicate locs in sampled batches
 *
 *   npm run validate:sitemap
 *   npm run validate:sitemap:ci   (faster samples; skips full light-bucket walk)
 */
import { ROBOTS_DISALLOW } from '../config/seo';
import { STATIC_ROUTES } from '../config/routes';
import { business } from '../config/business';
import { buildPageContent } from '../lib/content/engine';
import { getBlogPosts, getGuides } from '../lib/data/repository';
import {
  listAreaTargets,
  listCityTargets,
  listDistrictTargets,
  listServiceAreaTargets,
  listServiceAreaIntentTargets,
  listServiceCityTargets,
  listServiceCityIntentTargets,
  listServiceDistrictTargets,
  listServiceIntentTargets,
  listServiceTargets,
  listStateTargets,
} from '../lib/routing/inventory';
import { evaluatePublishing } from '../lib/routing/publishing';
import { blogPath, guidePath, normalizePath } from '../lib/routing/url';
import {
  getSitemapFile,
  getSitemapIndexXml,
  getSitemapXml,
  listSitemapFileNames,
  resetSitemapCache,
} from '../lib/sitemap/engine';
import { isW3cDate } from '../lib/sitemap/lastmod';
import type { PageTarget } from '../types/routing';

const ciMode = process.argv.includes('--ci') || process.env.VALIDATE_SITEMAP_CI === '1';
const errors: string[] = [];

function isDisallowed(path: string): boolean {
  const normalized = normalizePath(path);
  return ROBOTS_DISALLOW.some((rule) => {
    if (rule.endsWith('/')) {
      return normalized === rule.slice(0, -1) || normalized.startsWith(rule);
    }
    return normalized === rule || normalized.startsWith(`${rule}/`);
  });
}

function isIndexable(target: PageTarget): boolean {
  return evaluatePublishing(target, buildPageContent(target)).indexable;
}

function auditSample(
  label: string,
  targets: readonly PageTarget[],
  sampleSize: number,
): void {
  if (targets.length === 0) {
    console.log(`  ${label.padEnd(24)} (empty)`);
    return;
  }

  const step = Math.max(1, Math.floor(targets.length / sampleSize));
  let checked = 0;
  let indexable = 0;
  let noindex = 0;

  for (let i = 0; i < targets.length; i += step) {
    const target = targets[i]!;
    checked += 1;
    if (isIndexable(target)) {
      indexable += 1;
      if (isDisallowed(target.path)) {
        errors.push(`${label}: indexable ${target.path} is robots-disallowed`);
      }
    } else {
      noindex += 1;
      errors.push(`${label}: sitemap URL is noindex — ${target.path}`);
    }
  }

  console.log(
    `  ${label.padEnd(24)} sampled ${String(checked).padStart(4)} / ${String(targets.length).padStart(8)}  ` +
      `indexable ${String(indexable).padStart(4)}  noindex ${String(noindex).padStart(4)}`,
  );
}

function walkBucket(label: string, targets: readonly PageTarget[]): void {
  let indexable = 0;
  let excluded = 0;

  for (const target of targets) {
    if (isIndexable(target)) {
      indexable += 1;
      if (isDisallowed(target.path)) {
        errors.push(`${label}: indexable ${target.path} is robots-disallowed`);
      }
    } else {
      excluded += 1;
      errors.push(`${label}: sitemap URL is noindex — ${target.path}`);
    }
  }

  console.log(
    `  ${label.padEnd(24)} total ${String(targets.length).padStart(8)}  ` +
      `indexable ${String(indexable).padStart(8)}  noindex ${String(excluded).padStart(8)}`,
  );
}

function assertXmlShape(label: string, xml: string, root: 'urlset' | 'sitemapindex'): void {
  if (!xml.startsWith('<?xml version="1.0"')) {
    errors.push(`${label}: missing XML declaration`);
  }
  if (!xml.includes(`<${root}`)) {
    errors.push(`${label}: missing <${root}> root`);
  }
  if (root === 'urlset' && !xml.includes('</urlset>')) {
    errors.push(`${label}: missing </urlset>`);
  }
  if (root === 'sitemapindex' && !xml.includes('</sitemapindex>')) {
    errors.push(`${label}: missing </sitemapindex>`);
  }
}

function assertUrlEntries(label: string, xml: string): void {
  const blocks = xml.match(/<url>[\s\S]*?<\/url>/gu) ?? [];
  if (blocks.length === 0) {
    errors.push(`${label}: no <url> entries`);
    return;
  }

  const locs = new Set<string>();
  for (const block of blocks) {
    const loc = /<loc>([^<]+)<\/loc>/u.exec(block)?.[1];
    const lastmod = /<lastmod>([^<]+)<\/lastmod>/u.exec(block)?.[1];
    if (!loc) {
      errors.push(`${label}: url missing <loc>`);
      continue;
    }
    if (!loc.startsWith('https://')) {
      errors.push(`${label}: loc not https — ${loc}`);
    }
    if (!loc.startsWith(business.url)) {
      errors.push(`${label}: loc off-origin — ${loc}`);
    }
    if (!lastmod) {
      errors.push(`${label}: missing <lastmod> for ${loc}`);
    } else if (!isW3cDate(lastmod)) {
      errors.push(`${label}: invalid lastmod "${lastmod}" for ${loc}`);
    }
    if (locs.has(loc)) {
      errors.push(`${label}: duplicate loc ${loc}`);
    }
    locs.add(loc);
  }
}

resetSitemapCache();

console.log(`\nSitemap indexability + protocol check${ciMode ? ' (CI fast)' : ''}\n`);
console.log('1) Publishing-gate samples (every sitemap URL must be indexable):\n');

auditSample('service', listServiceTargets(), 20);
auditSample('serviceIntent', listServiceIntentTargets(), 40);
auditSample('state', listStateTargets(), 20);
auditSample('district', listDistrictTargets(), 50);
auditSample('city', listCityTargets(), 80);
auditSample('area', listAreaTargets(), ciMode ? 40 : 100);
auditSample('serviceInCity', listServiceCityTargets(), 80);
auditSample('serviceInDistrict', listServiceDistrictTargets(), 50);
auditSample('serviceInArea', listServiceAreaTargets(), ciMode ? 40 : 100);
auditSample('serviceInCityIntent', listServiceCityIntentTargets(), ciMode ? 30 : 60);
auditSample('serviceInAreaIntent', listServiceAreaIntentTargets(), ciMode ? 30 : 60);

if (!ciMode) {
  console.log('\n2) Full walk of sitemap-eligible light buckets:\n');

  walkBucket('service', listServiceTargets());
  walkBucket('serviceIntent', listServiceIntentTargets());
  walkBucket('state', listStateTargets());
  walkBucket('district', listDistrictTargets());
  walkBucket('city', listCityTargets());
  walkBucket('area', listAreaTargets());
  walkBucket('serviceInCity', listServiceCityTargets());
  walkBucket('serviceInDistrict', listServiceDistrictTargets());
} else {
  console.log('\n2) Full light-bucket walk skipped in CI mode\n');
}

console.log('\n3) Static / editorial sitemap candidates:\n');

const corePaths = [
  STATIC_ROUTES.home,
  STATIC_ROUTES.services,
  STATIC_ROUTES.serviceAreas,
  STATIC_ROUTES.about,
  STATIC_ROUTES.contact,
  STATIC_ROUTES.faq,
  STATIC_ROUTES.gallery,
  STATIC_ROUTES.projects,
  STATIC_ROUTES.blog,
  STATIC_ROUTES.guides,
  STATIC_ROUTES.compare,
] as const;

for (const path of corePaths) {
  if (isDisallowed(path)) {
    errors.push(`core path ${path} is robots-disallowed`);
  }
}
console.log(`  core hubs                 ${corePaths.length} (all indexable, allowed)`);

const guides = getGuides();
for (const guide of guides) {
  const path = guidePath(guide);
  if (!guide.published) errors.push(`unpublished guide would sitemap: ${path}`);
  if (isDisallowed(path)) errors.push(`guide ${path} is robots-disallowed`);
}
console.log(`  guides                    ${guides.length} published`);

const posts = getBlogPosts();
for (const post of posts) {
  const path = blogPath(post);
  if (!post.published) errors.push(`unpublished blog would sitemap: ${path}`);
  if (isDisallowed(path)) errors.push(`blog ${path} is robots-disallowed`);
}
console.log(`  blog posts                ${posts.length} published`);

console.log('\n4) Sitemap index sync + XML protocol samples:\n');

const names = listSitemapFileNames();
const indexXml = getSitemapIndexXml();
assertXmlShape('sitemap.xml', indexXml, 'sitemapindex');

const indexLocs = [...indexXml.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((m) => m[1]!);
const expectedLocs = names.map((name) => `${business.url}/sitemaps/${name}.xml`);

if (indexLocs.length !== expectedLocs.length) {
  errors.push(
    `sitemap index loc count ${indexLocs.length} != file name count ${expectedLocs.length}`,
  );
}
for (let i = 0; i < Math.min(indexLocs.length, expectedLocs.length); i += 1) {
  if (indexLocs[i] !== expectedLocs[i]) {
    errors.push(`sitemap index mismatch at ${i}: ${indexLocs[i]} vs ${expectedLocs[i]}`);
    break;
  }
}

const indexLastmods = indexXml.match(/<lastmod>/gu)?.length ?? 0;
if (indexLastmods !== names.length) {
  errors.push(`sitemap index lastmod count ${indexLastmods} != files ${names.length}`);
}

console.log(`  index files               ${names.length}`);
console.log(`  index locs synced         ${indexLocs.length === expectedLocs.length ? 'yes' : 'NO'}`);

const resolvedSamples = new Set<string>();
for (const hint of ['core', 'services', 'guides', 'blog', 'cities']) {
  if (names.includes(hint)) resolvedSamples.add(hint);
}
for (const prefix of ['areas', 'service-area', 'service-city-intent']) {
  const hit = names.find((n) => n === prefix || n.startsWith(`${prefix}-`));
  if (hit) resolvedSamples.add(hit);
}

for (const name of resolvedSamples) {
  const file = getSitemapFile(name);
  const xml = getSitemapXml(name);
  if (!file || !xml) {
    errors.push(`missing sitemap batch: ${name}`);
    continue;
  }
  assertXmlShape(name, xml, 'urlset');
  assertUrlEntries(name, xml);
  console.log(`  ${name.padEnd(28)} ${String(file.urls.length).padStart(5)} urls (loc+lastmod ok)`);
}

console.log('\n5) Exactly-one sitemap membership (light buckets):\n');

const membership = new Map<string, string>();
const lightExact = names.filter((name) =>
  /^(core|services|service-intents|states|districts|cities|service-city|service-district|guides|blog|images)(-\d+)?$/u.test(
    name,
  ),
);
for (const name of lightExact) {
  const file = getSitemapFile(name);
  if (!file) {
    errors.push(`missing light sitemap for membership check: ${name}`);
    continue;
  }
  for (const url of file.urls) {
    const prior = membership.get(url.loc);
    if (prior) {
      errors.push(`URL in multiple sitemaps: ${url.loc} (${prior} and ${name})`);
    } else {
      membership.set(url.loc, name);
    }
  }
}
console.log(
  `  light files checked         ${lightExact.length}  unique locs ${membership.size}`,
);

console.log('\nPolicy: every sitemap URL is indexable, https, has lastmod, and');
console.log('appears in exactly one light sitemap batch. Soft content floors are advisory.\n');

if (errors.length > 0) {
  console.error(`Sitemap validation FAILED (${errors.length}):\n`);
  for (const error of errors.slice(0, 40)) console.error(`  ✗ ${error}`);
  if (errors.length > 40) console.error(`  … ${errors.length - 40} more`);
  process.exit(1);
}

console.log('Sitemap validation passed — indexable, synced, protocol-valid samples.\n');
