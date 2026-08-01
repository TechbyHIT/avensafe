/**
 * Seeds published locality areas for every city from data/city-localities.json,
 * then wires ring adjacency so every area page has nearby internal links.
 *
 *   npx tsx scripts/seed-city-localities.ts
 *   npx tsx scripts/seed-city-localities.ts --dry-run
 *   npx tsx scripts/seed-city-localities.ts --wire-only
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { areaSchema, areasFileSchema, type Area } from '../lib/data/schemas';
import {
  getCityById,
  getSearchIntents,
  getServices,
} from '../lib/data/repository';
import { slugify } from '../lib/utils/text';

type LocalitySeed = { readonly name: string; readonly slug?: string };
type CityLocalitiesFile = Record<string, readonly LocalitySeed[]>;

const dryRun = process.argv.includes('--dry-run');
const wireOnly = process.argv.includes('--wire-only');

const localitiesPath = resolve('data/city-localities.json');
const areasPath = resolve('data/areas.json');
const seeds = JSON.parse(readFileSync(localitiesPath, 'utf8')) as CityLocalitiesFile;
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
  const city = getCityById(cityId);
  // Full city slug avoids 3-letter collisions across towns (hin/ten/ram/…).
  if (city?.slug) return `ar-${city.slug}-`;
  return 'ar-loc-';
}

function mapBuiltForm(cityBuiltForm: string): Area['builtForm'] {
  switch (cityBuiltForm) {
    case 'high-rise':
      return 'high-rise';
    case 'independent-houses':
      return 'independent-houses';
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

/** Prev/next neighbours by name so every locality has crawlable nearby links. */
function wireAdjacency(areas: Area[]): Area[] {
  const byCity = new Map<string, Area[]>();
  for (const area of areas) {
    if (!area.published) continue;
    const bucket = byCity.get(area.cityId);
    if (bucket) bucket.push(area);
    else byCity.set(area.cityId, [area]);
  }

  const nextAdj = new Map<string, string[]>();
  for (const bucket of byCity.values()) {
    const sorted = [...bucket].sort((a, b) => a.name.localeCompare(b.name));
    const n = sorted.length;
    if (n < 2) continue;
    for (let i = 0; i < n; i += 1) {
      const ids = new Set<string>();
      for (const offset of [-2, -1, 1, 2, 3]) {
        const j = (i + offset + n * 3) % n;
        if (j === i) continue;
        ids.add(sorted[j]!.id);
      }
      nextAdj.set(sorted[i]!.id, [...ids]);
    }
  }

  return areas.map((area) => {
    const wired = nextAdj.get(area.id);
    if (!wired || wired.length === 0) return area;
    const merged = [...new Set([...(area.adjacentAreaIds ?? []), ...wired])].slice(0, 8);
    if (
      merged.length === area.adjacentAreaIds.length &&
      merged.every((id, index) => id === area.adjacentAreaIds[index])
    ) {
      return area;
    }
    return { ...area, adjacentAreaIds: merged };
  });
}

const toAdd: Area[] = [];
const skipped: { slug: string; reason: string }[] = [];

if (!wireOnly) {
  for (const [cityId, localities] of Object.entries(seeds)) {
    const city = getCityById(cityId);
    if (!city?.published) {
      skipped.push({ slug: cityId, reason: 'unknown or unpublished city' });
      continue;
    }

    const prefix = areaIdPrefix(cityId);
    const slugsInCity = existingSlugsByCity.get(cityId) ?? new Set();
    existingSlugsByCity.set(cityId, slugsInCity);
    const builtForm = mapBuiltForm(city.builtForm);

    for (const entry of localities) {
      const slug = entry.slug ?? slugify(entry.name);
      if (!slug || slugsInCity.has(slug)) continue;
      if (serviceSlugs.has(slug)) {
        skipped.push({ slug, reason: 'service slug collision' });
        continue;
      }
      if (intentSlugs.has(slug)) {
        skipped.push({ slug, reason: 'intent slug collision' });
        continue;
      }

      const areaId = `${prefix}${slug}`;
      if (existingIds.has(areaId)) {
        skipped.push({ slug, reason: 'duplicate id' });
        continue;
      }

      const row: Area = {
        id: areaId,
        slug,
        name: entry.name,
        cityId,
        profile: 'mixed',
        builtForm,
        traits: [...city.traits],
        notes: buildNotes(city.name, entry.name),
        landmarks: buildLandmarks(city.name, entry.name),
        adjacentAreaIds: [],
        published: true,
      };
      areaSchema.parse(row);
      toAdd.push(row);
      existingIds.add(areaId);
      slugsInCity.add(slug);
    }
  }
}

console.log(`\nSeed city localities${dryRun ? ' (dry run)' : ''}${wireOnly ? ' (wire only)' : ''}\n`);
console.log(`  New areas to add : ${toAdd.length}`);
console.log(`  Skipped          : ${skipped.length}`);

const cityIds = [...new Set(toAdd.map((area) => area.cityId))];
for (const cityId of cityIds) {
  const count = toAdd.filter((area) => area.cityId === cityId).length;
  console.log(`  ${getCityById(cityId)?.name ?? cityId}: +${count}`);
}

const merged = wireAdjacency([...existing, ...toAdd]);
const changedAdj = merged.filter((area, index) => {
  const before = [...existing, ...toAdd][index];
  if (!before) return true;
  return JSON.stringify(before.adjacentAreaIds) !== JSON.stringify(area.adjacentAreaIds);
}).length;

console.log(`  Adjacency updates: ${changedAdj}`);

if (dryRun) {
  console.log('\nDry run — areas.json not modified.\n');
  process.exit(0);
}

areasFileSchema.parse(merged);
writeFileSync(areasPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
console.log(`\nWrote data/areas.json (${merged.length} areas, +${toAdd.length} new)\n`);
