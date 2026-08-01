/**
 * Seeds Telangana circle / mandal localities (Hyderabad GHMC, Medchal–RR–
 * Sangareddy belt, and district hubs across the state).
 *
 *   npx tsx scripts/seed-tg-region-localities.ts
 *   npx tsx scripts/seed-tg-region-localities.ts --dry-run
 *   npm run seed:tg-regions
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { areaSchema, areasFileSchema, type Area } from '../lib/data/schemas';
import { getCityById, getSearchIntents, getServices } from '../lib/data/repository';
import { slugify } from '../lib/utils/text';

const dryRun = process.argv.includes('--dry-run');

type Kind = NonNullable<Area['locationKind']>;

interface SeedRow {
  readonly name: string;
  readonly kind?: Kind;
  readonly slug?: string;
}

const TG_REGION_SEEDS: Readonly<Record<string, readonly SeedRow[]>> = {
  'ct-hyderabad': [
    { name: 'Amberpet', kind: 'area' },
    { name: 'Ameerpet', kind: 'area' },
    { name: 'Asif Nagar', kind: 'area', slug: 'asif-nagar' },
    { name: 'Bahadurpura', kind: 'area' },
    { name: 'Bandlaguda', kind: 'area' },
    { name: 'Charminar', kind: 'area' },
    { name: 'Golconda', kind: 'area' },
    { name: 'Himayatnagar', kind: 'locality' },
    { name: 'Khairatabad', kind: 'area' },
    { name: 'Musheerabad', kind: 'area' },
    { name: 'Nampally', kind: 'area' },
    { name: 'Saidabad', kind: 'area' },
    { name: 'Secunderabad', kind: 'area' },
    { name: 'Shaikpet', kind: 'area' },
    { name: 'Tirumalagiri', kind: 'area' },
    { name: 'Kukatpally', kind: 'area' },
    { name: 'Quthbullapur', kind: 'mandal' },
    { name: 'Medchal', kind: 'mandal' },
    { name: 'Malkajgiri', kind: 'area' },
    { name: 'Alwal', kind: 'locality' },
    { name: 'Bachupally', kind: 'locality' },
    { name: 'Dundigal-Gandimaisamma', kind: 'mandal', slug: 'dundigal-gandimaisamma' },
    { name: 'Ghatkesar', kind: 'mandal' },
    { name: 'Kapra', kind: 'area' },
    { name: 'Keesara', kind: 'mandal' },
    { name: 'Medipally', kind: 'mandal' },
    { name: 'Uppal', kind: 'area' },
    { name: 'Rajendranagar', kind: 'mandal' },
    { name: 'Serilingampally', kind: 'mandal' },
    { name: 'Shamshabad', kind: 'mandal' },
    { name: 'Chevella', kind: 'mandal' },
    { name: 'Ibrahimpatnam', kind: 'mandal' },
    { name: 'Maheshwaram', kind: 'mandal' },
    { name: 'Shabad', kind: 'mandal' },
    { name: 'Shankarpally', kind: 'mandal' },
  ],
  'ct-shamirpet': [{ name: 'Shamirpet', kind: 'mandal', slug: 'shamirpet-mandal' }],
  'ct-sangareddy': [
    { name: 'Sangareddy City', kind: 'town', slug: 'sangareddy-city' },
    { name: 'Patancheru', kind: 'mandal' },
    { name: 'Ameenpur', kind: 'mandal' },
    { name: 'Gummadidala', kind: 'mandal' },
    { name: 'Jinnaram', kind: 'mandal' },
    { name: 'Zaheerabad', kind: 'mandal' },
  ],
  'ct-bhongir': [
    { name: 'Bhongir City', kind: 'town', slug: 'bhongir-city' },
    { name: 'Yadagirigutta', kind: 'mandal' },
    { name: 'Choutuppal', kind: 'mandal' },
    { name: 'Alair', kind: 'mandal' },
  ],
  'ct-nalgonda': [
    { name: 'Nalgonda City', kind: 'town', slug: 'nalgonda-city' },
    { name: 'Miryalaguda', kind: 'mandal' },
    { name: 'Devarakonda', kind: 'mandal' },
    { name: 'Nakrekal', kind: 'mandal' },
    { name: 'Chityal', kind: 'mandal' },
    { name: 'Munugode', kind: 'mandal' },
  ],
  'ct-suryapet': [
    { name: 'Suryapet City', kind: 'town', slug: 'suryapet-city' },
    { name: 'Kodad', kind: 'mandal' },
    { name: 'Huzurnagar', kind: 'mandal' },
    { name: 'Chivvemla', kind: 'mandal' },
  ],
  'ct-hanamkonda': [
    { name: 'Hanamkonda City', kind: 'town', slug: 'hanamkonda-city' },
    { name: 'Kazipet', kind: 'locality' },
  ],
  'ct-warangal': [
    { name: 'Warangal City', kind: 'town', slug: 'warangal-city' },
    { name: 'Parkal', kind: 'mandal' },
    { name: 'Wardhannapet', kind: 'mandal' },
  ],
  'ct-jangaon': [{ name: 'Jangaon City', kind: 'town', slug: 'jangaon-city' }],
  'ct-karimnagar': [
    { name: 'Karimnagar City', kind: 'town', slug: 'karimnagar-city' },
    { name: 'Huzurabad', kind: 'mandal' },
    { name: 'Jammikunta', kind: 'mandal' },
    { name: 'Choppadandi', kind: 'mandal' },
  ],
  'ct-khammam': [
    { name: 'Khammam Urban', kind: 'area', slug: 'khammam-urban' },
    { name: 'Khammam Rural', kind: 'mandal', slug: 'khammam-rural' },
    { name: 'Kallur', kind: 'mandal' },
    { name: 'Madhira', kind: 'mandal' },
    { name: 'Wyra', kind: 'mandal' },
    { name: 'Sathupalli', kind: 'mandal' },
  ],
  'ct-nizamabad': [
    { name: 'Nizamabad North', kind: 'area', slug: 'nizamabad-north' },
    { name: 'Nizamabad South', kind: 'area', slug: 'nizamabad-south' },
    { name: 'Armoor', kind: 'mandal' },
    { name: 'Bodhan', kind: 'mandal' },
    { name: 'Bheemgal', kind: 'mandal' },
  ],
  'ct-mahbubnagar': [
    { name: 'Mahabubnagar City', kind: 'town', slug: 'mahabubnagar-city' },
    { name: 'Jadcherla', kind: 'mandal' },
    { name: 'Balanagar', kind: 'mandal' },
    { name: 'Bhoothpur', kind: 'mandal' },
  ],
  'ct-adilabad': [
    { name: 'Adilabad City', kind: 'town', slug: 'adilabad-city' },
    { name: 'Utnoor', kind: 'mandal' },
    { name: 'Boath', kind: 'mandal' },
    { name: 'Bela', kind: 'mandal' },
  ],
  'ct-ramagundam': [{ name: 'Ramagundam City', kind: 'town', slug: 'ramagundam-city' }],
  'ct-peddapalli': [
    { name: 'Peddapalli City', kind: 'town', slug: 'peddapalli-city' },
    { name: 'Manthani', kind: 'mandal' },
    { name: 'Sultanabad', kind: 'mandal' },
  ],
  'ct-siddipet': [
    { name: 'Siddipet City', kind: 'town', slug: 'siddipet-city' },
    { name: 'Gajwel', kind: 'mandal' },
    { name: 'Husnabad', kind: 'mandal' },
    { name: 'Dubbak', kind: 'mandal' },
  ],
};

const areasPath = resolve('data/areas.json');
const localitiesPath = resolve('data/city-localities.json');

const existing = areasFileSchema.parse(JSON.parse(readFileSync(areasPath, 'utf8')));
const cityLocalities = JSON.parse(readFileSync(localitiesPath, 'utf8')) as Record<
  string,
  { name: string; slug?: string }[]
>;

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

function notesFor(cityName: string, areaName: string, kind: Kind | undefined): string {
  if (kind === 'mandal') {
    return `${areaName} mandal near ${cityName} covers apartment and independent-house stock where balcony safety nets, invisible grills, and bird control are specified after survey rather than from a flat rate card.`;
  }
  if (kind === 'town') {
    return `${areaName} in the ${cityName} belt mixes market-road commercial property with residential colonies, so opening sizes and access for installation vary street by street.`;
  }
  return `${areaName} in ${cityName} has apartment and independent-house stock where child-safe spacing, bird nets, and drying systems are commonly requested after handover or renovation.`;
}

function landmarksFor(cityName: string, areaName: string): string[] {
  return [`${areaName} main road`, `${cityName} region`, `${areaName} residential belt`];
}

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
    return {
      ...area,
      adjacentAreaIds: [...new Set([...(area.adjacentAreaIds ?? []), ...wired])].slice(0, 8),
    };
  });
}

const toAdd: Area[] = [];
const kindUpdates: Area[] = [];
let localityFileAdds = 0;

for (const [cityId, rows] of Object.entries(TG_REGION_SEEDS)) {
  const city = getCityById(cityId);
  if (!city?.published) {
    console.warn(`Skip unknown city ${cityId}`);
    continue;
  }

  const slugsInCity = existingSlugsByCity.get(cityId) ?? new Set();
  existingSlugsByCity.set(cityId, slugsInCity);
  const builtForm = mapBuiltForm(city.builtForm);
  const prefix = `ar-${city.slug}-`;

  const localityBucket = cityLocalities[cityId] ? [...cityLocalities[cityId]] : [];
  const localitySlugs = new Set(localityBucket.map((entry) => entry.slug ?? slugify(entry.name)));

  for (const row of rows) {
    const slug = row.slug ?? slugify(row.name);
    if (!slug || serviceSlugs.has(slug) || intentSlugs.has(slug)) continue;

    if (!localitySlugs.has(slug)) {
      localityBucket.push(row.slug ? { name: row.name, slug: row.slug } : { name: row.name });
      localitySlugs.add(slug);
      localityFileAdds += 1;
    }

    if (slugsInCity.has(slug)) {
      const current = existing.find((area) => area.cityId === cityId && area.slug === slug);
      if (current && row.kind && !current.locationKind) {
        kindUpdates.push({ ...current, locationKind: row.kind });
      }
      continue;
    }

    const areaId = `${prefix}${slug}`;
    if (existingIds.has(areaId)) continue;

    const area: Area = {
      id: areaId,
      slug,
      name: row.name,
      cityId,
      ...(row.kind ? { locationKind: row.kind } : {}),
      profile: 'mixed',
      builtForm,
      traits: [...city.traits],
      notes: notesFor(city.name, row.name, row.kind),
      landmarks: landmarksFor(city.name, row.name),
      adjacentAreaIds: [],
      published: true,
    };
    areaSchema.parse(area);
    toAdd.push(area);
    existingIds.add(areaId);
    slugsInCity.add(slug);
  }

  cityLocalities[cityId] = localityBucket;
}

const byId = new Map(existing.map((area) => [area.id, area]));
for (const updated of kindUpdates) byId.set(updated.id, updated);
const merged = wireAdjacency([...byId.values(), ...toAdd]);

console.log(`\nTG region locality seed${dryRun ? ' (dry run)' : ''}`);
console.log(`  New areas          : ${toAdd.length}`);
console.log(`  Kind enrichments   : ${kindUpdates.length}`);
console.log(`  city-localities +  : ${localityFileAdds}`);
for (const cityId of Object.keys(TG_REGION_SEEDS)) {
  const count = toAdd.filter((area) => area.cityId === cityId).length;
  if (count > 0) console.log(`  ${getCityById(cityId)?.name}: +${count}`);
}

if (dryRun) {
  console.log('\nDry run — files not written.\n');
  process.exit(0);
}

areasFileSchema.parse(merged);
writeFileSync(areasPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
writeFileSync(localitiesPath, `${JSON.stringify(cityLocalities, null, 2)}\n`, 'utf8');
console.log(`\nWrote areas.json (${merged.length}) and updated city-localities.json\n`);
