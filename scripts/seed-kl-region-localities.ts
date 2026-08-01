/**
 * Seeds Kerala taluk / region localities (Thiruvananthapuram–Kasaragod belt,
 * Ernakulam/Kochi, Malabar, and hill districts).
 *
 *   npx tsx scripts/seed-kl-region-localities.ts
 *   npx tsx scripts/seed-kl-region-localities.ts --dry-run
 *   npm run seed:kl-regions
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

const KL_REGION_SEEDS: Readonly<Record<string, readonly SeedRow[]>> = {
  'ct-thiruvananthapuram': [
    { name: 'Thiruvananthapuram City', kind: 'town', slug: 'thiruvananthapuram-city' },
    { name: 'Neyyattinkara', kind: 'mandal' },
    { name: 'Nedumangad', kind: 'mandal' },
    { name: 'Chirayinkeezhu', kind: 'mandal' },
    { name: 'Varkala', kind: 'mandal' },
    { name: 'Kattakada', kind: 'mandal' },
  ],
  'ct-kollam': [
    { name: 'Kollam City', kind: 'town', slug: 'kollam-city' },
    { name: 'Karunagappally', kind: 'mandal' },
    { name: 'Kunnathur', kind: 'mandal' },
    { name: 'Kottarakkara', kind: 'mandal' },
    { name: 'Pathanapuram', kind: 'mandal' },
    { name: 'Punalur', kind: 'mandal' },
  ],
  'ct-pathanamthitta': [
    { name: 'Pathanamthitta City', kind: 'town', slug: 'pathanamthitta-city' },
    { name: 'Adoor', kind: 'mandal' },
    { name: 'Kozhencherry', kind: 'mandal' },
    { name: 'Konni', kind: 'mandal' },
    { name: 'Mallappally', kind: 'mandal' },
    { name: 'Ranni', kind: 'mandal' },
    { name: 'Thiruvalla', kind: 'mandal' },
  ],
  'ct-alappuzha': [
    { name: 'Alappuzha City', kind: 'town', slug: 'alappuzha-city' },
    { name: 'Ambalappuzha', kind: 'mandal' },
    { name: 'Cherthala', kind: 'mandal' },
    { name: 'Karthikappally', kind: 'mandal' },
    { name: 'Chengannur', kind: 'mandal' },
    { name: 'Mavelikkara', kind: 'mandal' },
    { name: 'Kuttanad', kind: 'mandal' },
  ],
  'ct-kottayam': [
    { name: 'Kottayam City', kind: 'town', slug: 'kottayam-city' },
    { name: 'Changanassery', kind: 'mandal' },
    { name: 'Vaikom', kind: 'mandal' },
    { name: 'Meenachil', kind: 'mandal' },
    { name: 'Kanjirappally', kind: 'mandal' },
  ],
  'ct-painavu': [
    { name: 'Devikulam', kind: 'mandal' },
    { name: 'Udumbanchola', kind: 'mandal' },
    { name: 'Thodupuzha', kind: 'mandal' },
    { name: 'Peerumade', kind: 'mandal' },
  ],
  'ct-kochi': [
    { name: 'Kanayannur', kind: 'mandal', slug: 'kanayannur' },
    { name: 'Kunnathunad', kind: 'mandal' },
    { name: 'Aluva', kind: 'mandal' },
    { name: 'Kothamangalam', kind: 'mandal' },
    { name: 'Muvattupuzha', kind: 'mandal' },
    { name: 'Paravur', kind: 'mandal' },
  ],
  'ct-thrissur': [
    { name: 'Thrissur City', kind: 'town', slug: 'thrissur-city' },
    { name: 'Chavakkad', kind: 'mandal' },
    { name: 'Kodungallur', kind: 'mandal' },
    { name: 'Mukundapuram', kind: 'mandal' },
    { name: 'Talappilly', kind: 'mandal' },
    { name: 'Chalakudy', kind: 'mandal' },
  ],
  'ct-palakkad': [
    { name: 'Palakkad City', kind: 'town', slug: 'palakkad-city' },
    { name: 'Chittur', kind: 'mandal' },
    { name: 'Ottapalam', kind: 'mandal' },
    { name: 'Mannarkkad', kind: 'mandal' },
    { name: 'Pattambi', kind: 'mandal' },
    { name: 'Alathur', kind: 'mandal' },
  ],
  'ct-malappuram': [
    { name: 'Malappuram City', kind: 'town', slug: 'malappuram-city' },
    { name: 'Ernad', kind: 'mandal' },
    { name: 'Tirur', kind: 'mandal' },
    { name: 'Tirurangadi', kind: 'mandal' },
    { name: 'Perinthalmanna', kind: 'mandal' },
    { name: 'Ponnani', kind: 'mandal' },
    { name: 'Nilambur', kind: 'mandal' },
    { name: 'Kondotty', kind: 'mandal' },
  ],
  'ct-kozhikode': [
    { name: 'Kozhikode City', kind: 'town', slug: 'kozhikode-city' },
    { name: 'Koyilandy', kind: 'mandal' },
    { name: 'Vadakara', kind: 'mandal' },
    { name: 'Thamarassery', kind: 'mandal' },
  ],
  'ct-kalpetta': [
    { name: 'Sulthan Bathery', kind: 'mandal', slug: 'sulthan-bathery' },
    { name: 'Mananthavady', kind: 'mandal' },
    { name: 'Vythiri', kind: 'mandal' },
  ],
  'ct-kannur': [
    { name: 'Kannur City', kind: 'town', slug: 'kannur-city' },
    { name: 'Thalassery', kind: 'mandal' },
    { name: 'Iritty', kind: 'mandal' },
    { name: 'Payyanur', kind: 'mandal' },
    { name: 'Taliparamba', kind: 'mandal' },
  ],
  'ct-kasaragod': [
    { name: 'Kasaragod City', kind: 'town', slug: 'kasaragod-city' },
    { name: 'Hosdurg', kind: 'mandal' },
    { name: 'Vellarikundu', kind: 'mandal' },
    { name: 'Manjeswaram', kind: 'mandal' },
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
    return `${areaName} taluk near ${cityName} covers town and village housing where balcony safety nets, invisible grills, and bird control are specified after survey rather than from a flat rate card.`;
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

for (const [cityId, rows] of Object.entries(KL_REGION_SEEDS)) {
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

console.log(`\nKL region locality seed${dryRun ? ' (dry run)' : ''}`);
console.log(`  New areas          : ${toAdd.length}`);
console.log(`  Kind enrichments   : ${kindUpdates.length}`);
console.log(`  city-localities +  : ${localityFileAdds}`);
for (const cityId of Object.keys(KL_REGION_SEEDS)) {
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
