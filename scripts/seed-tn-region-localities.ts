/**
 * Seeds Tamil Nadu taluk / zone localities (Chennai belts, Chengalpattu,
 * Coimbatore–Tiruppur, Madurai–Trichy, industrial & hill towns).
 *
 *   npx tsx scripts/seed-tn-region-localities.ts
 *   npx tsx scripts/seed-tn-region-localities.ts --dry-run
 *   npm run seed:tn-regions
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

const TN_REGION_SEEDS: Readonly<Record<string, readonly SeedRow[]>> = {
  'ct-chennai': [
    { name: 'Egmore-Nungambakkam', kind: 'area', slug: 'egmore-nungambakkam' },
    { name: 'Mylapore', kind: 'locality' },
    { name: 'Perambur', kind: 'locality' },
    { name: 'Tondiarpet', kind: 'locality' },
    { name: 'Ambattur', kind: 'area' },
    { name: 'Maduravoyal', kind: 'locality' },
    { name: 'Madhavaram', kind: 'locality' },
    { name: 'Guindy', kind: 'area' },
    { name: 'Sholinganallur', kind: 'area' },
    { name: 'Velachery', kind: 'locality' },
    { name: 'Alandur', kind: 'locality' },
  ],
  'ct-chengalpattu': [
    { name: 'Chengalpattu City', kind: 'town', slug: 'chengalpattu-city' },
    { name: 'Tambaram', kind: 'town' },
    { name: 'Pallavaram', kind: 'town' },
    { name: 'Tiruporur', kind: 'mandal' },
    { name: 'Vandalur', kind: 'mandal' },
    { name: 'Thirukazhukundram', kind: 'mandal' },
    { name: 'Madurantakam', kind: 'mandal' },
    { name: 'Cheyyur', kind: 'mandal' },
  ],
  'ct-kanchipuram': [
    { name: 'Kanchipuram City', kind: 'town', slug: 'kanchipuram-city' },
    { name: 'Sriperumbudur', kind: 'mandal' },
    { name: 'Uthiramerur', kind: 'mandal' },
    { name: 'Walajabad', kind: 'mandal' },
    { name: 'Kundrathur', kind: 'mandal' },
    { name: 'Oragadam', kind: 'area' },
  ],
  'ct-coimbatore': [
    { name: 'Coimbatore North', kind: 'area', slug: 'coimbatore-north' },
    { name: 'Coimbatore South', kind: 'area', slug: 'coimbatore-south' },
    { name: 'Mettupalayam', kind: 'mandal' },
    { name: 'Pollachi', kind: 'mandal' },
    { name: 'Sulur', kind: 'mandal' },
    { name: 'Annur', kind: 'mandal' },
    { name: 'Kinathukadavu', kind: 'mandal' },
    { name: 'Valparai', kind: 'mandal' },
  ],
  'ct-tiruppur': [
    { name: 'Tiruppur North', kind: 'area', slug: 'tiruppur-north' },
    { name: 'Tiruppur South', kind: 'area', slug: 'tiruppur-south' },
    { name: 'Avinashi', kind: 'mandal' },
    { name: 'Palladam', kind: 'mandal' },
    { name: 'Dharapuram', kind: 'mandal' },
    { name: 'Kangeyam', kind: 'mandal' },
    { name: 'Udumalaipettai', kind: 'mandal' },
  ],
  'ct-madurai': [
    { name: 'Madurai North', kind: 'area', slug: 'madurai-north' },
    { name: 'Madurai South', kind: 'area', slug: 'madurai-south' },
    { name: 'Melur', kind: 'mandal' },
    { name: 'Tirumangalam', kind: 'mandal' },
    { name: 'Vadipatti', kind: 'mandal' },
    { name: 'Usilampatti', kind: 'mandal' },
    { name: 'Peraiyur', kind: 'mandal' },
  ],
  'ct-tiruchirappalli': [
    { name: 'Tiruchirappalli West', kind: 'area', slug: 'tiruchirappalli-west' },
    { name: 'Tiruchirappalli East', kind: 'area', slug: 'tiruchirappalli-east' },
    { name: 'Srirangam', kind: 'locality' },
    { name: 'Manapparai', kind: 'mandal' },
    { name: 'Lalgudi', kind: 'mandal' },
    { name: 'Musiri', kind: 'mandal' },
    { name: 'Thuraiyur', kind: 'mandal' },
  ],
  'ct-salem': [
    { name: 'Salem City', kind: 'town', slug: 'salem-city' },
    { name: 'Attur', kind: 'mandal' },
    { name: 'Mettur', kind: 'mandal' },
    { name: 'Omalur', kind: 'mandal' },
    { name: 'Edappadi', kind: 'mandal' },
    { name: 'Sankari', kind: 'mandal' },
    { name: 'Yercaud', kind: 'mandal' },
  ],
  'ct-erode': [
    { name: 'Erode City', kind: 'town', slug: 'erode-city' },
    { name: 'Gobichettipalayam', kind: 'mandal' },
    { name: 'Bhavani', kind: 'mandal' },
    { name: 'Perundurai', kind: 'mandal' },
    { name: 'Sathyamangalam', kind: 'mandal' },
    { name: 'Kodumudi', kind: 'mandal' },
  ],
  'ct-vellore': [
    { name: 'Vellore City', kind: 'town', slug: 'vellore-city' },
    { name: 'Katpadi', kind: 'mandal' },
    { name: 'Gudiyatham', kind: 'mandal' },
    { name: 'Anaicut', kind: 'mandal' },
    { name: 'Pernambut', kind: 'mandal' },
    { name: 'K.V. Kuppam', kind: 'mandal', slug: 'kv-kuppam' },
  ],
  'ct-tirunelveli': [
    { name: 'Tirunelveli City', kind: 'town', slug: 'tirunelveli-city' },
    { name: 'Palayamkottai', kind: 'locality' },
    { name: 'Ambasamudram', kind: 'mandal' },
    { name: 'Nanguneri', kind: 'mandal' },
    { name: 'Cheranmahadevi', kind: 'mandal' },
  ],
  'ct-tenkasi': [{ name: 'Tenkasi City', kind: 'town', slug: 'tenkasi-city' }],
  'ct-thoothukudi': [
    { name: 'Thoothukudi City', kind: 'town', slug: 'thoothukudi-city' },
    { name: 'Tiruchendur', kind: 'mandal' },
    { name: 'Srivaikuntam', kind: 'mandal' },
    { name: 'Kovilpatti', kind: 'mandal' },
    { name: 'Sathankulam', kind: 'mandal' },
    { name: 'Ettayapuram', kind: 'mandal' },
  ],
  'ct-dindigul': [
    { name: 'Dindigul City', kind: 'town', slug: 'dindigul-city' },
    { name: 'Palani', kind: 'mandal' },
    { name: 'Kodaikanal', kind: 'mandal' },
    { name: 'Nilakottai', kind: 'mandal' },
    { name: 'Athoor', kind: 'mandal' },
    { name: 'Oddanchatram', kind: 'mandal' },
  ],
  'ct-ooty': [
    { name: 'Udhagamandalam', kind: 'town', slug: 'udhagamandalam' },
    { name: 'Coonoor', kind: 'mandal' },
    { name: 'Kotagiri', kind: 'mandal' },
    { name: 'Gudalur', kind: 'mandal' },
    { name: 'Pandalur', kind: 'mandal' },
  ],
  'ct-thanjavur': [
    { name: 'Thanjavur City', kind: 'town', slug: 'thanjavur-city' },
    { name: 'Kumbakonam', kind: 'mandal' },
    { name: 'Pattukkottai', kind: 'mandal' },
    { name: 'Papanasam', kind: 'mandal' },
    { name: 'Orathanadu', kind: 'mandal' },
    { name: 'Thiruvaiyaru', kind: 'mandal' },
  ],
  'ct-cuddalore': [
    { name: 'Cuddalore City', kind: 'town', slug: 'cuddalore-city' },
    { name: 'Chidambaram', kind: 'mandal' },
    { name: 'Panruti', kind: 'mandal' },
    { name: 'Neyveli', kind: 'town' },
    { name: 'Vriddhachalam', kind: 'mandal' },
    { name: 'Kurinjipadi', kind: 'mandal' },
  ],
  'ct-nagercoil': [
    { name: 'Nagercoil City', kind: 'town', slug: 'nagercoil-city' },
    { name: 'Agastheeswaram', kind: 'mandal' },
    { name: 'Kalkulam', kind: 'mandal' },
    { name: 'Vilavancode', kind: 'mandal' },
    { name: 'Thovalai', kind: 'mandal' },
    { name: 'Killiyoor', kind: 'mandal' },
  ],
  'ct-krishnagiri': [
    { name: 'Krishnagiri City', kind: 'town', slug: 'krishnagiri-city' },
    { name: 'Denkanikottai', kind: 'mandal' },
    { name: 'Pochampalli', kind: 'mandal' },
    { name: 'Uthangarai', kind: 'mandal' },
  ],
  'ct-hosur': [{ name: 'Hosur City', kind: 'town', slug: 'hosur-city' }],
  'ct-dharmapuri': [
    { name: 'Dharmapuri City', kind: 'town', slug: 'dharmapuri-city' },
    { name: 'Harur', kind: 'mandal' },
    { name: 'Palacode', kind: 'mandal' },
    { name: 'Pennagaram', kind: 'mandal' },
    { name: 'Pappireddipatti', kind: 'mandal' },
  ],
  'ct-viluppuram': [
    { name: 'Viluppuram City', kind: 'town', slug: 'viluppuram-city' },
    { name: 'Tindivanam', kind: 'mandal' },
    { name: 'Gingee', kind: 'mandal' },
    { name: 'Ulundurpet', kind: 'mandal' },
    { name: 'Sankarapuram', kind: 'mandal' },
  ],
  'ct-kallakurichi': [{ name: 'Kallakurichi City', kind: 'town', slug: 'kallakurichi-city' }],
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

for (const [cityId, rows] of Object.entries(TN_REGION_SEEDS)) {
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

console.log(`\nTN region locality seed${dryRun ? ' (dry run)' : ''}`);
console.log(`  New areas          : ${toAdd.length}`);
console.log(`  Kind enrichments   : ${kindUpdates.length}`);
console.log(`  city-localities +  : ${localityFileAdds}`);
for (const cityId of Object.keys(TN_REGION_SEEDS)) {
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
