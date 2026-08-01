/**
 * Tops up every published city to at least `--min` localities, then seeds areas.
 *
 *   npx tsx scripts/expand-more-localities.ts
 *   npx tsx scripts/expand-more-localities.ts --min=48
 *   npx tsx scripts/expand-more-localities.ts --dry-run
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { slugify } from '../lib/utils/text';

const dryRun = process.argv.includes('--dry-run');
const min = Number(
  process.argv.find((arg) => arg.startsWith('--min='))?.split('=')[1] ?? '48',
);

const EXTRA_STEMS = [
  'Phase 1',
  'Phase 2',
  'Phase 3',
  'Extension',
  'Layout',
  'Colony',
  'Nagar',
  'Enclave',
  'Residency',
  'Heights',
  'Township',
  'Main Road',
  'Cross Road',
  'Park Road',
  'Lake View',
  'Hill View',
  'Garden Colony',
  'Officers Colony',
  'Bank Colony',
  'Postal Colony',
  'Police Lines',
  'University Road',
  'Medical College Road',
  'Tech Park Road',
  'Outer Ring Road',
  'Inner Ring Road',
  'NH Bypass',
  'Old Market',
  'New Market',
  'Vegetable Market',
  'Fish Market Road',
  'Temple Street',
  'Mosque Road',
  'Church Road',
  'Fort Road',
  'Jail Road',
  'Stadium Colony',
  'Sports Complex',
  'Civil Lines',
  'Cantonment',
  'Secretariat Road',
  'Collector Office Road',
  'District Court Road',
  'Ward 1',
  'Ward 2',
  'Ward 3',
  'Ward 4',
  'Ward 5',
  'Sector A',
  'Sector B',
  'Sector C',
  'Block A',
  'Block B',
  'North Extension',
  'South Extension',
  'East Extension',
  'West Extension',
  'Central Area',
  'Riverside',
  'Lakeside',
  'Green Valley',
  'Sunrise Colony',
  'Moonlight Nagar',
  'Silver Oaks',
  'Golden Nest',
  'Palm Grove',
  'Mango Grove',
  'Banyan Colony',
  'Neem Nagar',
  'Tulsi Nagar',
  'Rose Garden',
  'Jasmine Colony',
  'Lotus Colony',
  'Marigold Nagar',
  'Orchid Enclave',
  'IT Corridor',
  'SEZ Road',
  'Industrial Layout',
  'Warehouse Road',
  'Transport Nagar',
  'Auto Stand Area',
  'Railway Colony',
  'Platform Road',
  'Depot Road',
  'Milk Dairy Road',
  'Sugar Factory Road',
  'Rice Mill Road',
  'Cotton Mill Road',
  'Power House Road',
  'Water Tank Road',
  'Pipeline Road',
  'Canal Road',
  'Bridge Road',
  'Check Post',
  'Toll Plaza Road',
  'Petrol Bunk Road',
  'Theatre Road',
  'College Campus Area',
  'School Road',
  'Hostel Road',
  'Staff Quarters',
  'Income Tax Colony',
  'LIC Colony',
  'BHEL Township',
  'NTPC Colony',
  'Port Area',
  'Harbour Road',
  'Beach Extension',
  'Coastal Road',
] as const;

const citiesPath = resolve('data/cities.json');
const areasPath = resolve('data/areas.json');
const localitiesPath = resolve('data/city-localities.json');

const cities = JSON.parse(readFileSync(citiesPath, 'utf8')) as {
  id: string;
  slug: string;
  name: string;
  published: boolean;
}[];
const areas = JSON.parse(readFileSync(areasPath, 'utf8')) as {
  cityId: string;
  slug: string;
  name: string;
}[];
const localities = JSON.parse(readFileSync(localitiesPath, 'utf8')) as Record<
  string,
  { name: string; slug?: string }[]
>;

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

let citiesTopped = 0;
let namesAdded = 0;

for (const city of cities) {
  if (!city.published) continue;

  const existingAreas = areas.filter((area) => area.cityId === city.id);
  const bucket = [...(localities[city.id] ?? [])];
  const seen = new Set<string>([
    ...existingAreas.map((area) => area.slug),
    ...bucket.map((entry) => entry.slug ?? slugify(entry.name)),
  ]);

  const need = Math.max(0, min - seen.size);
  if (need === 0) {
    localities[city.id] = bucket;
    continue;
  }

  const offset = hashString(city.slug) % EXTRA_STEMS.length;
  const rotated = [
    ...EXTRA_STEMS.slice(offset),
    ...EXTRA_STEMS.slice(0, offset),
  ];

  let addedHere = 0;
  for (const stem of rotated) {
    if (addedHere >= need) break;
    const name = `${city.name} ${stem}`;
    const slug = slugify(name);
    if (!slug || seen.has(slug) || seen.has(slugify(stem))) continue;
    // Also try stem alone when unique in this city.
    const stemSlug = slugify(stem);
    const useStemAlone = !seen.has(stemSlug) && !/^(ward|sector|block|phase)\b/iu.test(stem);
    const finalName = useStemAlone ? stem : name;
    const finalSlug = slugify(finalName);
    if (seen.has(finalSlug)) continue;
    bucket.push({ name: finalName });
    seen.add(finalSlug);
    addedHere += 1;
    namesAdded += 1;
  }

  // Numbered wards if still short.
  for (let ward = 6; addedHere < need && ward <= 60; ward += 1) {
    const name = `${city.name} Ward ${ward}`;
    const slug = slugify(name);
    if (seen.has(slug)) continue;
    bucket.push({ name });
    seen.add(slug);
    addedHere += 1;
    namesAdded += 1;
  }

  localities[city.id] = bucket;
  if (addedHere > 0) citiesTopped += 1;
}

console.log(`\nExpand more localities${dryRun ? ' (dry run)' : ''}\n`);
console.log(`  Min per city   : ${min}`);
console.log(`  Cities topped  : ${citiesTopped}`);
console.log(`  Names added    : ${namesAdded}`);

if (dryRun) {
  console.log('\nDry run — files not modified.\n');
  process.exit(0);
}

writeFileSync(localitiesPath, `${JSON.stringify(localities, null, 2)}\n`, 'utf8');
console.log(`Wrote ${localitiesPath}`);

const seed = spawnSync('npx', ['tsx', 'scripts/seed-city-localities.ts'], {
  stdio: 'inherit',
  shell: true,
});
process.exit(seed.status ?? 1);
