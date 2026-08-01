/**
 * Seeds Karnataka taluk / region localities (Bengaluru belts, Mysuru, coastal,
 * North Karnataka, Malnad, and tourism towns).
 *
 *   npx tsx scripts/seed-ka-region-localities.ts
 *   npx tsx scripts/seed-ka-region-localities.ts --dry-run
 *   npm run seed:ka-regions
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

const KA_REGION_SEEDS: Readonly<Record<string, readonly SeedRow[]>> = {
  'ct-bengaluru': [
    { name: 'Bengaluru Urban', kind: 'area', slug: 'bengaluru-urban' },
    { name: 'Bengaluru North', kind: 'area', slug: 'bengaluru-north' },
    { name: 'Bengaluru South', kind: 'area', slug: 'bengaluru-south' },
    { name: 'Bengaluru East', kind: 'area', slug: 'bengaluru-east' },
    { name: 'Anekal', kind: 'mandal' },
    { name: 'Yelahanka', kind: 'locality' },
    { name: 'Bengaluru Rural', kind: 'mandal', slug: 'bengaluru-rural' },
    { name: 'Devanahalli', kind: 'mandal' },
    { name: 'Doddaballapura', kind: 'mandal' },
    { name: 'Hoskote', kind: 'mandal' },
    { name: 'Nelamangala', kind: 'mandal' },
  ],
  'ct-mysuru': [
    { name: 'Mysuru City', kind: 'town', slug: 'mysuru-city' },
    { name: 'Hunsur', kind: 'mandal' },
    { name: 'Nanjangud', kind: 'mandal' },
    { name: 'T. Narasipura', kind: 'mandal', slug: 't-narasipura' },
    { name: 'Periyapatna', kind: 'mandal' },
    { name: 'H.D. Kote', kind: 'mandal', slug: 'hd-kote' },
    { name: 'Krishnarajanagara', kind: 'mandal' },
  ],
  'ct-mangaluru': [
    { name: 'Mangaluru City', kind: 'town', slug: 'mangaluru-city' },
    { name: 'Bantwal', kind: 'mandal' },
    { name: 'Belthangady', kind: 'mandal' },
    { name: 'Puttur', kind: 'mandal' },
    { name: 'Sullia', kind: 'mandal' },
  ],
  'ct-udupi': [
    { name: 'Udupi City', kind: 'town', slug: 'udupi-city' },
    { name: 'Kundapura', kind: 'mandal' },
    { name: 'Karkala', kind: 'mandal' },
    { name: 'Byndoor', kind: 'mandal' },
    { name: 'Brahmavar', kind: 'mandal' },
  ],
  'ct-hubballi': [
    { name: 'Hubballi City', kind: 'town', slug: 'hubballi-city' },
    { name: 'Hubballi–Dharwad', kind: 'area', slug: 'hubballi-dharwad' },
  ],
  'ct-dharwad': [
    { name: 'Dharwad City', kind: 'town', slug: 'dharwad-city' },
    { name: 'Kalghatgi', kind: 'mandal' },
    { name: 'Kundgol', kind: 'mandal' },
    { name: 'Navalgund', kind: 'mandal' },
  ],
  'ct-belagavi': [
    { name: 'Belagavi City', kind: 'town', slug: 'belagavi-city' },
    { name: 'Chikkodi', kind: 'mandal' },
    { name: 'Athani', kind: 'mandal' },
    { name: 'Gokak', kind: 'mandal' },
    { name: 'Bailhongal', kind: 'mandal' },
    { name: 'Hukkeri', kind: 'mandal' },
    { name: 'Khanapur', kind: 'mandal' },
    { name: 'Ramdurg', kind: 'mandal' },
    { name: 'Raibag', kind: 'mandal' },
    { name: 'Mudalagi', kind: 'mandal' },
  ],
  'ct-ballari': [
    { name: 'Ballari City', kind: 'town', slug: 'ballari-city' },
    { name: 'Sandur', kind: 'mandal' },
    { name: 'Siruguppa', kind: 'mandal' },
    { name: 'Kampli', kind: 'mandal' },
    { name: 'Kudligi', kind: 'mandal' },
  ],
  'ct-hospete': [{ name: 'Hosapete', kind: 'town', slug: 'hosapete' }],
  'ct-shivamogga': [
    { name: 'Shivamogga City', kind: 'town', slug: 'shivamogga-city' },
    { name: 'Bhadravati', kind: 'mandal' },
    { name: 'Sagara', kind: 'mandal' },
    { name: 'Soraba', kind: 'mandal' },
    { name: 'Shikaripura', kind: 'mandal' },
    { name: 'Hosanagara', kind: 'mandal' },
    { name: 'Thirthahalli', kind: 'mandal' },
  ],
  'ct-hassan': [
    { name: 'Hassan City', kind: 'town', slug: 'hassan-city' },
    { name: 'Belur', kind: 'mandal' },
    { name: 'Channarayapatna', kind: 'mandal' },
    { name: 'Arsikere', kind: 'mandal' },
    { name: 'Holenarasipura', kind: 'mandal' },
    { name: 'Sakleshpur', kind: 'mandal' },
    { name: 'Alur', kind: 'mandal' },
    { name: 'Arakalagudu', kind: 'mandal' },
  ],
  'ct-madikeri': [
    { name: 'Madikeri', kind: 'town', slug: 'madikeri-town' },
    { name: 'Virajpet', kind: 'mandal' },
    { name: 'Somwarpet', kind: 'mandal' },
  ],
  'ct-chikkamagaluru': [
    { name: 'Chikkamagaluru City', kind: 'town', slug: 'chikkamagaluru-city' },
    { name: 'Mudigere', kind: 'mandal' },
    { name: 'Koppa', kind: 'mandal' },
    { name: 'Sringeri', kind: 'mandal' },
    { name: 'Kadur', kind: 'mandal' },
    { name: 'Tarikere', kind: 'mandal' },
    { name: 'Kalasa', kind: 'mandal' },
    { name: 'N.R. Pura', kind: 'mandal', slug: 'nr-pura' },
  ],
  'ct-tumakuru': [
    { name: 'Tumakuru City', kind: 'town', slug: 'tumakuru-city' },
    { name: 'Tiptur', kind: 'mandal' },
    { name: 'Gubbi', kind: 'mandal' },
    { name: 'Madhugiri', kind: 'mandal' },
    { name: 'Kunigal', kind: 'mandal' },
    { name: 'Koratagere', kind: 'mandal' },
    { name: 'Sira', kind: 'mandal' },
    { name: 'Pavagada', kind: 'mandal' },
    { name: 'Turuvekere', kind: 'mandal' },
  ],
  'ct-davangere': [
    { name: 'Davanagere City', kind: 'town', slug: 'davanagere-city' },
    { name: 'Harihar', kind: 'mandal' },
    { name: 'Channagiri', kind: 'mandal' },
    { name: 'Jagalur', kind: 'mandal' },
    { name: 'Honnali', kind: 'mandal' },
    { name: 'Nyamathi', kind: 'mandal' },
  ],
  'ct-chitradurga': [
    { name: 'Chitradurga City', kind: 'town', slug: 'chitradurga-city' },
    { name: 'Hiriyur', kind: 'mandal' },
    { name: 'Challakere', kind: 'mandal' },
    { name: 'Holalkere', kind: 'mandal' },
    { name: 'Hosadurga', kind: 'mandal' },
    { name: 'Molakalmuru', kind: 'mandal' },
  ],
  'ct-vijayapura': [
    { name: 'Vijayapura City', kind: 'town', slug: 'vijayapura-city' },
    { name: 'Indi', kind: 'mandal' },
    { name: 'Muddebihal', kind: 'mandal' },
    { name: 'Sindagi', kind: 'mandal' },
    { name: 'Basavana Bagewadi', kind: 'mandal' },
  ],
  'ct-kalaburagi': [
    { name: 'Kalaburagi City', kind: 'town', slug: 'kalaburagi-city' },
    { name: 'Aland', kind: 'mandal' },
    { name: 'Chincholi', kind: 'mandal' },
    { name: 'Afzalpur', kind: 'mandal' },
    { name: 'Sedam', kind: 'mandal' },
    { name: 'Chittapur', kind: 'mandal' },
    { name: 'Jewargi', kind: 'mandal' },
  ],
  'ct-raichuru': [
    { name: 'Raichur City', kind: 'town', slug: 'raichur-city' },
    { name: 'Sindhanur', kind: 'mandal' },
    { name: 'Lingasugur', kind: 'mandal' },
    { name: 'Manvi', kind: 'mandal' },
    { name: 'Devadurga', kind: 'mandal' },
  ],
  'ct-koppala': [
    { name: 'Koppal City', kind: 'town', slug: 'koppal-city' },
    { name: 'Gangavathi', kind: 'mandal' },
    { name: 'Kushtagi', kind: 'mandal' },
    { name: 'Yelburga', kind: 'mandal' },
    { name: 'Kanakagiri', kind: 'mandal' },
  ],
  'ct-bidar': [
    { name: 'Bidar City', kind: 'town', slug: 'bidar-city' },
    { name: 'Basavakalyan', kind: 'mandal' },
    { name: 'Bhalki', kind: 'mandal' },
    { name: 'Humnabad', kind: 'mandal' },
    { name: 'Aurad', kind: 'mandal' },
  ],
  'ct-kolar': [
    { name: 'Kolar City', kind: 'town', slug: 'kolar-city' },
    { name: 'Malur', kind: 'mandal' },
    { name: 'Bangarapet', kind: 'mandal' },
    { name: 'Srinivaspur', kind: 'mandal' },
    { name: 'Mulbagal', kind: 'mandal' },
  ],
  'ct-chikkaballapura': [
    { name: 'Chikkaballapur City', kind: 'town', slug: 'chikkaballapur-city' },
    { name: 'Sidlaghatta', kind: 'mandal' },
    { name: 'Bagepalli', kind: 'mandal' },
    { name: 'Chintamani', kind: 'mandal' },
    { name: 'Gudibanda', kind: 'mandal' },
    { name: 'Gauribidanur', kind: 'mandal' },
  ],
  'ct-mandya': [
    { name: 'Mandya City', kind: 'town', slug: 'mandya-city' },
    { name: 'Maddur', kind: 'mandal' },
    { name: 'Srirangapatna', kind: 'mandal' },
    { name: 'Pandavapura', kind: 'mandal' },
    { name: 'Nagamangala', kind: 'mandal' },
    { name: 'Malavalli', kind: 'mandal' },
    { name: 'Krishnarajpet', kind: 'mandal' },
  ],
  'ct-ramanagara': [
    { name: 'Ramanagara City', kind: 'town', slug: 'ramanagara-city' },
    { name: 'Kanakapura', kind: 'mandal' },
    { name: 'Channapatna', kind: 'mandal' },
    { name: 'Magadi', kind: 'mandal' },
    { name: 'Harohalli', kind: 'mandal' },
  ],
  'ct-karwar': [
    { name: 'Karwar City', kind: 'town', slug: 'karwar-city' },
    { name: 'Ankola', kind: 'mandal' },
    { name: 'Kumta', kind: 'mandal' },
    { name: 'Honnavar', kind: 'mandal' },
    { name: 'Bhatkal', kind: 'mandal' },
    { name: 'Sirsi', kind: 'mandal' },
    { name: 'Yellapur', kind: 'mandal' },
    { name: 'Haliyal', kind: 'mandal' },
    { name: 'Dandeli', kind: 'mandal' },
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

for (const [cityId, rows] of Object.entries(KA_REGION_SEEDS)) {
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

console.log(`\nKA region locality seed${dryRun ? ' (dry run)' : ''}`);
console.log(`  New areas          : ${toAdd.length}`);
console.log(`  Kind enrichments   : ${kindUpdates.length}`);
console.log(`  city-localities +  : ${localityFileAdds}`);
for (const cityId of Object.keys(KA_REGION_SEEDS)) {
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
