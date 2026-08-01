/**
 * Seeds Maharashtra taluk / region localities (Mumbai MMR, Pune belt,
 * Vidarbha, Marathwada, and Konkan).
 *
 *   npx tsx scripts/seed-mh-region-localities.ts
 *   npx tsx scripts/seed-mh-region-localities.ts --dry-run
 *   npm run seed:mh-regions
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

const MH_REGION_SEEDS: Readonly<Record<string, readonly SeedRow[]>> = {
  'ct-mumbai': [
    { name: 'Mumbai City', kind: 'area', slug: 'mumbai-city' },
    { name: 'Mumbai Suburban', kind: 'area', slug: 'mumbai-suburban' },
    { name: 'Andheri', kind: 'locality' },
    { name: 'Borivali', kind: 'locality' },
    { name: 'Kurla', kind: 'locality' },
  ],
  'ct-thane': [
    { name: 'Thane City', kind: 'town', slug: 'thane-city' },
    { name: 'Kalyan', kind: 'mandal' },
    { name: 'Bhiwandi', kind: 'mandal' },
    { name: 'Shahapur', kind: 'mandal' },
    { name: 'Murbad', kind: 'mandal' },
  ],
  'ct-palghar': [
    { name: 'Palghar City', kind: 'town', slug: 'palghar-city' },
    { name: 'Vasai', kind: 'mandal' },
    { name: 'Virar', kind: 'town' },
    { name: 'Dahanu', kind: 'mandal' },
    { name: 'Talasari', kind: 'mandal' },
  ],
  'ct-navi-mumbai': [
    { name: 'Panvel', kind: 'mandal' },
    { name: 'Uran', kind: 'mandal' },
  ],
  'ct-pune': [
    { name: 'Pune City', kind: 'area', slug: 'pune-city' },
    { name: 'Pimpri-Chinchwad', kind: 'area', slug: 'pimpri-chinchwad' },
    { name: 'Haveli', kind: 'mandal' },
    { name: 'Mulshi', kind: 'mandal' },
    { name: 'Mawal', kind: 'mandal' },
    { name: 'Khed', kind: 'mandal' },
    { name: 'Shirur', kind: 'mandal' },
    { name: 'Baramati', kind: 'mandal' },
    { name: 'Daund', kind: 'mandal' },
    { name: 'Bhor', kind: 'mandal' },
    { name: 'Junnar', kind: 'mandal' },
    { name: 'Indapur', kind: 'mandal' },
    { name: 'Ambegaon', kind: 'mandal' },
  ],
  'ct-nashik': [
    { name: 'Nashik City', kind: 'town', slug: 'nashik-city' },
    { name: 'Sinnar', kind: 'mandal' },
    { name: 'Niphad', kind: 'mandal' },
    { name: 'Igatpuri', kind: 'mandal' },
    { name: 'Dindori', kind: 'mandal' },
    { name: 'Yeola', kind: 'mandal' },
    { name: 'Malegaon', kind: 'mandal' },
  ],
  'ct-nagpur': [
    { name: 'Nagpur Urban', kind: 'area', slug: 'nagpur-urban' },
    { name: 'Nagpur Rural', kind: 'mandal', slug: 'nagpur-rural' },
    { name: 'Hingna', kind: 'mandal' },
    { name: 'Kamptee', kind: 'mandal' },
    { name: 'Umred', kind: 'mandal' },
    { name: 'Katol', kind: 'mandal' },
    { name: 'Kalameshwar', kind: 'mandal' },
    { name: 'Saoner', kind: 'mandal' },
  ],
  'ct-aurangabad': [
    { name: 'Chhatrapati Sambhajinagar', kind: 'town', slug: 'chhatrapati-sambhajinagar' },
    { name: 'Gangapur', kind: 'mandal' },
    { name: 'Paithan', kind: 'mandal' },
    { name: 'Kannad', kind: 'mandal' },
    { name: 'Sillod', kind: 'mandal' },
    { name: 'Vaijapur', kind: 'mandal' },
  ],
  'ct-kolhapur': [
    { name: 'Karveer', kind: 'mandal' },
    { name: 'Hatkanangale', kind: 'mandal' },
    { name: 'Shirol', kind: 'mandal' },
    { name: 'Panhala', kind: 'mandal' },
    { name: 'Kagal', kind: 'mandal' },
    { name: 'Gadhinglaj', kind: 'mandal' },
  ],
  'ct-solapur': [
    { name: 'Solapur North', kind: 'area', slug: 'solapur-north' },
    { name: 'Solapur South', kind: 'area', slug: 'solapur-south' },
    { name: 'Akkalkot', kind: 'mandal' },
    { name: 'Barshi', kind: 'mandal' },
    { name: 'Pandharpur', kind: 'mandal' },
    { name: 'Sangola', kind: 'mandal' },
    { name: 'Malshiras', kind: 'mandal' },
  ],
  'ct-satara': [
    { name: 'Satara City', kind: 'town', slug: 'satara-city' },
    { name: 'Karad', kind: 'mandal' },
    { name: 'Wai', kind: 'mandal' },
    { name: 'Mahabaleshwar', kind: 'mandal' },
    { name: 'Phaltan', kind: 'mandal' },
    { name: 'Koregaon', kind: 'mandal' },
  ],
  'ct-sangli': [
    { name: 'Sangli City', kind: 'town', slug: 'sangli-city' },
    { name: 'Miraj', kind: 'mandal' },
    { name: 'Tasgaon', kind: 'mandal' },
    { name: 'Walwa', kind: 'mandal', slug: 'walwa' },
    { name: 'Kavathe Mahankal', kind: 'mandal', slug: 'kavathe-mahankal' },
    { name: 'Jat', kind: 'mandal' },
  ],
  'ct-ahmednagar': [
    { name: 'Ahmednagar City', kind: 'town', slug: 'ahmednagar-city' },
    { name: 'Shirdi', kind: 'mandal', slug: 'shirdi' },
    { name: 'Rahuri', kind: 'mandal' },
    { name: 'Shrirampur', kind: 'mandal' },
    { name: 'Sangamner', kind: 'mandal' },
    { name: 'Kopargaon', kind: 'mandal' },
    { name: 'Nevasa', kind: 'mandal' },
  ],
  'ct-jalgaon': [
    { name: 'Jalgaon City', kind: 'town', slug: 'jalgaon-city' },
    { name: 'Bhusawal', kind: 'mandal' },
    { name: 'Chalisgaon', kind: 'mandal' },
    { name: 'Amalner', kind: 'mandal' },
    { name: 'Pachora', kind: 'mandal' },
  ],
  'ct-amravati': [
    { name: 'Amravati City', kind: 'town', slug: 'amravati-city' },
    { name: 'Achalpur', kind: 'mandal' },
    { name: 'Daryapur', kind: 'mandal' },
    { name: 'Morshi', kind: 'mandal' },
    { name: 'Chandur Railway', kind: 'mandal', slug: 'chandur-railway' },
  ],
  'ct-akola': [
    { name: 'Akola City', kind: 'town', slug: 'akola-city' },
    { name: 'Balapur', kind: 'mandal' },
    { name: 'Murtizapur', kind: 'mandal' },
    { name: 'Telhara', kind: 'mandal' },
  ],
  'ct-chandrapur': [
    { name: 'Chandrapur City', kind: 'town', slug: 'chandrapur-city' },
    { name: 'Ballarpur', kind: 'mandal' },
    { name: 'Warora', kind: 'mandal' },
    { name: 'Rajura', kind: 'mandal' },
    { name: 'Brahmapuri', kind: 'mandal' },
  ],
  'ct-ratnagiri': [
    { name: 'Ratnagiri City', kind: 'town', slug: 'ratnagiri-city' },
    { name: 'Chiplun', kind: 'mandal' },
    { name: 'Dapoli', kind: 'mandal' },
    { name: 'Guhagar', kind: 'mandal' },
    { name: 'Rajapur', kind: 'mandal' },
  ],
  'ct-oros': [
    { name: 'Kankavli', kind: 'mandal' },
    { name: 'Kudal', kind: 'mandal' },
    { name: 'Sawantwadi', kind: 'mandal' },
    { name: 'Malvan', kind: 'mandal' },
    { name: 'Vengurla', kind: 'mandal' },
  ],
  'ct-alibag': [
    { name: 'Alibag City', kind: 'town', slug: 'alibag-city' },
    { name: 'Pen', kind: 'mandal' },
    { name: 'Khalapur', kind: 'mandal' },
    { name: 'Karjat', kind: 'mandal' },
    { name: 'Mangaon', kind: 'mandal' },
    { name: 'Roha', kind: 'mandal' },
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
    return `${areaName} taluka near ${cityName} covers town and village housing where balcony safety nets, invisible grills, and bird control are specified after survey rather than from a flat rate card.`;
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

for (const [cityId, rows] of Object.entries(MH_REGION_SEEDS)) {
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

console.log(`\nMH region locality seed${dryRun ? ' (dry run)' : ''}`);
console.log(`  New areas          : ${toAdd.length}`);
console.log(`  Kind enrichments   : ${kindUpdates.length}`);
console.log(`  city-localities +  : ${localityFileAdds}`);
for (const cityId of Object.keys(MH_REGION_SEEDS)) {
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
