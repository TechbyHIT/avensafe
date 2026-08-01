/**
 * Seeds Andhra Pradesh regional / mandal localities from the coverage list
 * (Visakhapatnam, Vijayawada/NTR, Guntur, Tirupati, Krishna, Godavari belts,
 * Kakinada, Anantapur, Kurnool, Nellore).
 *
 *   npx tsx scripts/seed-ap-region-localities.ts
 *   npx tsx scripts/seed-ap-region-localities.ts --dry-run
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

/** City hub → localities / mandals to publish under that city. */
const AP_REGION_SEEDS: Readonly<Record<string, readonly SeedRow[]>> = {
  'ct-visakhapatnam': [
    { name: 'Gajuwaka', kind: 'mandal' },
    { name: 'Pendurthi', kind: 'mandal' },
    { name: 'Anandapuram', kind: 'mandal' },
    { name: 'Bheemunipatnam', kind: 'mandal' },
    { name: 'Padmanabham', kind: 'mandal' },
    { name: 'Sabbavaram', kind: 'mandal' },
    { name: 'Paravada', kind: 'mandal' },
    { name: 'Seethammadhara', kind: 'locality' },
    { name: 'Maharanipeta', kind: 'locality' },
    { name: 'Gopalapatnam', kind: 'locality' },
    { name: 'Pedagantyada', kind: 'mandal' },
    { name: 'Visakhapatnam Rural', kind: 'mandal', slug: 'visakhapatnam-rural' },
  ],
  'ct-vijayawada': [
    { name: 'Vijayawada Central', kind: 'area', slug: 'vijayawada-central' },
    { name: 'Vijayawada East', kind: 'area', slug: 'vijayawada-east' },
    { name: 'Vijayawada West', kind: 'area', slug: 'vijayawada-west' },
    { name: 'Vijayawada North', kind: 'area', slug: 'vijayawada-north' },
    { name: 'Vijayawada Rural', kind: 'mandal', slug: 'vijayawada-rural' },
    { name: 'Ibrahimpatnam', kind: 'mandal' },
    { name: 'G. Konduru', kind: 'mandal', slug: 'g-konduru' },
    { name: 'Mylavaram', kind: 'mandal' },
    { name: 'Nandigama', kind: 'mandal' },
    { name: 'Tiruvuru', kind: 'mandal' },
    { name: 'Jaggaiahpet', kind: 'mandal' },
    { name: 'Kanchikacherla', kind: 'mandal' },
    { name: 'Gannavaram', kind: 'mandal' },
    { name: 'Penamaluru', kind: 'mandal' },
    { name: 'Kankipadu', kind: 'mandal' },
  ],
  'ct-guntur': [
    { name: 'Guntur East', kind: 'area', slug: 'guntur-east' },
    { name: 'Guntur West', kind: 'area', slug: 'guntur-west' },
    { name: 'Mangalagiri', kind: 'mandal' },
    { name: 'Tadepalle', kind: 'mandal' },
    { name: 'Pedakakani', kind: 'mandal' },
    { name: 'Thullur', kind: 'mandal' },
    { name: 'Amaravati Capital Region', kind: 'area', slug: 'amaravati-capital-region' },
    { name: 'Prathipadu', kind: 'mandal' },
    { name: 'Ponnur', kind: 'mandal' },
    { name: 'Chebrolu', kind: 'mandal' },
  ],
  'ct-tenali': [{ name: 'Tenali', kind: 'town', slug: 'tenali-town' }],
  'ct-tirupati': [
    { name: 'Tirupati Urban', kind: 'area', slug: 'tirupati-urban' },
    { name: 'Tirupati Rural', kind: 'mandal', slug: 'tirupati-rural' },
    { name: 'Renigunta', kind: 'mandal' },
    { name: 'Srikalahasti', kind: 'mandal' },
    { name: 'Chandragiri', kind: 'mandal' },
    { name: 'Puttur', kind: 'mandal' },
    { name: 'Naidupeta', kind: 'mandal' },
    { name: 'Sullurpet', kind: 'mandal' },
    { name: 'Tada', kind: 'mandal' },
    { name: 'Satyavedu', kind: 'mandal' },
  ],
  'ct-machilipatnam': [
    { name: 'Machilipatnam North', kind: 'area', slug: 'machilipatnam-north' },
    { name: 'Machilipatnam South', kind: 'area', slug: 'machilipatnam-south' },
    { name: 'Gudivada', kind: 'mandal' },
    { name: 'Avanigadda', kind: 'mandal' },
    { name: 'Pedana', kind: 'mandal' },
    { name: 'Vuyyuru', kind: 'mandal' },
    { name: 'Pamarru', kind: 'mandal' },
  ],
  'ct-rajahmundry': [
    { name: 'Rajamahendravaram Urban', kind: 'area', slug: 'rajamahendravaram-urban' },
    { name: 'Rajamahendravaram Rural', kind: 'mandal', slug: 'rajamahendravaram-rural' },
    { name: 'Kadiam', kind: 'mandal' },
    { name: 'Kovvur', kind: 'mandal' },
    { name: 'Alamuru', kind: 'mandal' },
  ],
  'ct-amalapuram': [
    { name: 'Amalapuram', kind: 'town', slug: 'amalapuram-town' },
    { name: 'Mummidivaram', kind: 'mandal' },
    { name: 'Razole', kind: 'mandal' },
    { name: 'Ramachandrapuram', kind: 'mandal' },
    { name: 'Kothapeta', kind: 'mandal' },
  ],
  'ct-eluru': [
    { name: 'Eluru', kind: 'town', slug: 'eluru-town' },
    { name: 'Nidadavole', kind: 'mandal' },
  ],
  'ct-bhimavaram': [
    { name: 'Bhimavaram', kind: 'town', slug: 'bhimavaram-town' },
    { name: 'Palakollu', kind: 'mandal' },
    { name: 'Akiveedu', kind: 'mandal' },
    { name: 'Attili', kind: 'mandal' },
    { name: 'Undi', kind: 'mandal' },
  ],
  'ct-tadepalligudem': [
    { name: 'Tadepalligudem', kind: 'town', slug: 'tadepalligudem-town' },
    { name: 'Tanuku', kind: 'mandal' },
    { name: 'West Godavari Kovvur', kind: 'mandal', slug: 'west-godavari-kovvur' },
  ],
  'ct-kakinada': [
    { name: 'Kakinada Urban', kind: 'area', slug: 'kakinada-urban' },
    { name: 'Kakinada Rural', kind: 'mandal', slug: 'kakinada-rural' },
    { name: 'Samalkota', kind: 'mandal' },
    { name: 'Pithapuram', kind: 'mandal' },
    { name: 'Peddapuram', kind: 'mandal' },
    { name: 'Jaggampeta', kind: 'mandal' },
    { name: 'Prathipadu', kind: 'mandal' },
    { name: 'Tuni', kind: 'mandal' },
    { name: 'Yeleswaram', kind: 'mandal' },
  ],
  'ct-ananthapuramu': [
    { name: 'Anantapur', kind: 'town', slug: 'anantapur-town' },
    { name: 'Dharmavaram', kind: 'mandal' },
    { name: 'Penukonda', kind: 'mandal' },
    { name: 'Tadipatri', kind: 'mandal' },
    { name: 'Kadiri', kind: 'mandal' },
    { name: 'Gooty', kind: 'mandal' },
    { name: 'Rayadurg', kind: 'mandal' },
  ],
  'ct-hindupur': [{ name: 'Hindupur', kind: 'town', slug: 'hindupur-town' }],
  'ct-puttaparthi': [{ name: 'Puttaparthi', kind: 'town', slug: 'puttaparthi-town' }],
  'ct-kurnool': [
    { name: 'Kurnool', kind: 'town', slug: 'kurnool-town' },
    { name: 'Adoni', kind: 'mandal' },
    { name: 'Yemmiganur', kind: 'mandal' },
    { name: 'Atmakur', kind: 'mandal' },
    { name: 'Pattikonda', kind: 'mandal' },
    { name: 'Kodumur', kind: 'mandal' },
  ],
  'ct-nandyal': [
    { name: 'Nandyal', kind: 'town', slug: 'nandyal-town' },
    { name: 'Allagadda', kind: 'mandal' },
    { name: 'Banaganapalle', kind: 'mandal' },
  ],
  'ct-nellore': [
    { name: 'Nellore Urban', kind: 'area', slug: 'nellore-urban' },
    { name: 'Nellore Rural', kind: 'mandal', slug: 'nellore-rural' },
    { name: 'Kavali', kind: 'mandal' },
    { name: 'Gudur', kind: 'mandal' },
    { name: 'Kovur', kind: 'mandal' },
    { name: 'Atmakur', kind: 'mandal' },
    { name: 'Buchireddypalem', kind: 'mandal' },
    { name: 'Venkatagiri', kind: 'mandal' },
    { name: 'Udayagiri', kind: 'mandal' },
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
    return `${areaName} mandal near ${cityName} covers town and village housing where balcony safety nets, invisible grills, and bird control are specified after survey rather than from a flat rate card.`;
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

for (const [cityId, rows] of Object.entries(AP_REGION_SEEDS)) {
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
      // Enrich existing rows with locationKind when missing.
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
const base = [...byId.values(), ...toAdd];
const merged = wireAdjacency(base);

console.log(`\nAP region locality seed${dryRun ? ' (dry run)' : ''}`);
console.log(`  New areas          : ${toAdd.length}`);
console.log(`  Kind enrichments   : ${kindUpdates.length}`);
console.log(`  city-localities +  : ${localityFileAdds}`);
for (const cityId of Object.keys(AP_REGION_SEEDS)) {
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
