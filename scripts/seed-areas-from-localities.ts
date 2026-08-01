/**
 * Appends published area rows for localities listed in *-localities.json
 * (from extract-localities-from-keywords.ts).
 *
 * Usage:
 *   npx tsx scripts/seed-areas-from-localities.ts keywords/hyderabad-keywords-localities.json
 *   npx tsx scripts/seed-areas-from-localities.ts keywords/hyderabad-keywords-localities.json --dry-run
 *   npx tsx scripts/seed-areas-from-localities.ts keywords/hyderabad-keywords-localities.json --city ct-hyderabad
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { areaSchema, areasFileSchema, type Area } from '../lib/data/schemas';
import {
  getCityById,
  getSearchIntents,
  getServices,
} from '../lib/data/repository';

type LocalityEntry = {
  slug: string;
  count: number;
  name: string;
  publishedInData: boolean;
};

type LocalitiesReport = Record<
  string,
  {
    cityName: string;
    citySlug: string;
    publishedAreas: number;
    uniqueLocalities: number;
    missingFromData: LocalityEntry[];
  }
>;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const cityFilter = args.find((arg) => arg.startsWith('--city='))?.slice('--city='.length);
const inputPath = args.find((arg) => !arg.startsWith('--'));

if (!inputPath) {
  console.error(
    'Usage: npx tsx scripts/seed-areas-from-localities.ts <localities.json> [--dry-run] [--city=<cityId>]',
  );
  process.exit(1);
}

const report = JSON.parse(readFileSync(resolve(inputPath), 'utf8')) as LocalitiesReport;
const areasPath = resolve('data/areas.json');
const existing = areasFileSchema.parse(JSON.parse(readFileSync(areasPath, 'utf8')));

const serviceSlugs = new Set(getServices().map((service) => service.slug));
const intentSlugs = new Set(getSearchIntents().map((intent) => intent.slug));
const existingIds = new Set(existing.map((area) => area.id));
const existingSlugsByCity = new Map<string, Set<string>>();
for (const area of existing) {
  let set = existingSlugsByCity.get(area.cityId);
  if (!set) {
    set = new Set();
    existingSlugsByCity.set(area.cityId, set);
  }
  set.add(area.slug);
}

function areaIdPrefix(cityId: string): string {
  const sample = existing.find((area) => area.cityId === cityId);
  if (sample) {
    const parts = sample.id.split('-');
    if (parts[0] === 'ar' && parts.length >= 3) {
      return `ar-${parts[1]}-`;
    }
  }
  const city = getCityById(cityId);
  const code = city?.slug.slice(0, 3) ?? 'loc';
  return `ar-${code}-`;
}

function mapBuiltForm(cityBuiltForm: string): Area['builtForm'] {
  switch (cityBuiltForm) {
    case 'high-rise':
      return 'high-rise';
    case 'independent-houses':
      return 'independent-houses';
    case 'mid-rise':
    case 'mixed':
      return 'mixed';
    default:
      return 'mixed';
  }
}

function buildNotes(cityName: string, areaName: string): string {
  return `${areaName} in ${cityName} mixes apartments and independent housing where balcony safety, invisible grills, and drying systems are commonly requested after handover or renovation.`;
}

function buildLandmarks(cityName: string, areaName: string): string[] {
  return [`${areaName} main road`, `${cityName} city limits`, `${areaName} residential belt`];
}

const toAdd: Area[] = [];
const skipped: { slug: string; reason: string }[] = [];

for (const [cityId, bucket] of Object.entries(report)) {
  if (cityFilter && cityId !== cityFilter) continue;

  const city = getCityById(cityId);
  if (!city) {
    console.warn(`Skipping unknown cityId ${cityId}`);
    continue;
  }

  const prefix = areaIdPrefix(cityId);
  const slugsInCity = existingSlugsByCity.get(cityId) ?? new Set();
  const builtForm = mapBuiltForm(city.builtForm);
  const traits = city.traits;

  for (const entry of bucket.missingFromData) {
    if (entry.publishedInData || slugsInCity.has(entry.slug)) continue;

    if (serviceSlugs.has(entry.slug)) {
      skipped.push({ slug: entry.slug, reason: 'service slug collision' });
      continue;
    }
    if (intentSlugs.has(entry.slug)) {
      skipped.push({ slug: entry.slug, reason: 'search-intent slug collision' });
      continue;
    }

    const areaId = `${prefix}${entry.slug}`;
    if (existingIds.has(areaId)) {
      skipped.push({ slug: entry.slug, reason: 'duplicate id' });
      continue;
    }

    const row: Area = {
      id: areaId,
      slug: entry.slug,
      name: entry.name,
      cityId,
      profile: 'mixed',
      builtForm,
      traits: [...traits],
      notes: buildNotes(city.name, entry.name),
      landmarks: buildLandmarks(city.name, entry.name),
      adjacentAreaIds: [],
      published: true,
    };

    areaSchema.parse(row);
    toAdd.push(row);
    existingIds.add(areaId);
    slugsInCity.add(entry.slug);
  }
}

console.log(`\nSeed areas from localities${dryRun ? ' (dry run)' : ''}\n`);
console.log(`  New areas to add : ${toAdd.length}`);
console.log(`  Skipped          : ${skipped.length}`);
if (skipped.length > 0 && skipped.length <= 10) {
  for (const item of skipped) {
    console.log(`    - ${item.slug}: ${item.reason}`);
  }
}

const cityIds = [...new Set(toAdd.map((area) => area.cityId))];
for (const cityId of cityIds) {
  const count = toAdd.filter((area) => area.cityId === cityId).length;
  const name = getCityById(cityId)?.name ?? cityId;
  console.log(`  ${name}: +${count}`);
}

if (toAdd.length === 0) {
  process.exit(0);
}

if (dryRun) {
  console.log('\nDry run — areas.json not modified.\n');
  process.exit(0);
}

const merged = [...existing, ...toAdd];
areasFileSchema.parse(merged);
writeFileSync(areasPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
console.log(`\nWrote ${toAdd.length} areas to data/areas.json\n`);
