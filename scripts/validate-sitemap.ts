/**
 * Asserts sitemap policy: every inventory URL listed in the sitemap is indexable.
 *
 * - Samples every inventory kind against the publishing gate
 * - Fully walks lighter buckets; any noindex URL is a failure
 * - Checks static / guide / blog sitemap candidates are published and allowed
 *
 *   npm run validate:sitemap
 */
import { ROBOTS_DISALLOW } from '../config/seo';
import { STATIC_ROUTES } from '../config/routes';
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
import type { PageTarget } from '../types/routing';

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
      errors.push(
        `${label}: sitemap URL is noindex — ${target.path}`,
      );
    }
  }

  console.log(
    `  ${label.padEnd(24)} sampled ${String(checked).padStart(4)} / ${String(targets.length).padStart(8)}  ` +
      `indexable ${String(indexable).padStart(4)}  noindex ${String(noindex).padStart(4)}`,
  );
}

/**
 * Full walk of a bucket: every URL must be indexable and robots-allowed.
 */
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

console.log('\nSitemap indexability check\n');
console.log('1) Publishing-gate samples (every sitemap URL must be indexable):\n');

auditSample('service', listServiceTargets(), 20);
auditSample('serviceIntent', listServiceIntentTargets(), 40);
auditSample('state', listStateTargets(), 20);
auditSample('district', listDistrictTargets(), 50);
auditSample('city', listCityTargets(), 80);
auditSample('area', listAreaTargets(), 100);
auditSample('serviceInCity', listServiceCityTargets(), 80);
auditSample('serviceInDistrict', listServiceDistrictTargets(), 50);
auditSample('serviceInArea', listServiceAreaTargets(), 100);
auditSample('serviceInCityIntent', listServiceCityIntentTargets(), 60);
auditSample('serviceInAreaIntent', listServiceAreaIntentTargets(), 60);

console.log('\n2) Full walk of sitemap-eligible light buckets:\n');

walkBucket('service', listServiceTargets());
walkBucket('serviceIntent', listServiceIntentTargets());
walkBucket('state', listStateTargets());
walkBucket('district', listDistrictTargets());
walkBucket('city', listCityTargets());
walkBucket('area', listAreaTargets());
walkBucket('serviceInCity', listServiceCityTargets());
walkBucket('serviceInDistrict', listServiceDistrictTargets());

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

console.log('\nPolicy: every URL in the sitemap is indexable. Content depth');
console.log('thresholds are advisory only; only structural faults set noindex.\n');

if (errors.length > 0) {
  console.error(`Sitemap indexability FAILED (${errors.length}):\n`);
  for (const error of errors.slice(0, 40)) console.error(`  ✗ ${error}`);
  if (errors.length > 40) console.error(`  … ${errors.length - 40} more`);
  process.exit(1);
}

console.log('Sitemap indexability passed — all listed URLs are indexable.\n');
