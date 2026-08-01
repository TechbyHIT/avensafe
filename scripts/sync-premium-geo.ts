/**
 * Syncs curated major cities + premium areas from the South India market list
 * into cities.json / city-localities.json / areas.json.
 *
 *   npx tsx scripts/sync-premium-geo.ts
 *   npx tsx scripts/sync-premium-geo.ts --dry-run
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  areaSchema,
  areasFileSchema,
  citiesFileSchema,
  type Area,
  type City,
  type District,
  type State,
  type TraitKey,
} from '../lib/data/schemas';
import { slugify } from '../lib/utils/text';

const dryRun = process.argv.includes('--dry-run');

type WantedPack = {
  readonly cities: readonly {
    readonly name: string;
    readonly slug?: string;
    readonly aliases?: readonly string[];
    readonly districtSlug?: string;
    readonly tier?: 1 | 2 | 3;
  }[];
  readonly premium: readonly {
    readonly citySlug: string;
    readonly cityAliases?: readonly string[];
    readonly areas: readonly string[];
  }[];
};

const WANTED: Record<string, WantedPack> = {
  'st-andhra-pradesh': {
    cities: [
      { name: 'Visakhapatnam', tier: 1 },
      { name: 'Vijayawada', tier: 1 },
      { name: 'Guntur', tier: 2 },
      { name: 'Tirupati', tier: 2 },
      { name: 'Kurnool', tier: 2 },
      { name: 'Rajahmundry', aliases: ['rajamahendravaram'], tier: 2 },
      { name: 'Kakinada', tier: 2 },
      { name: 'Nellore', tier: 2 },
      {
        name: 'Anantapur',
        aliases: ['ananthapuramu'],
        districtSlug: 'ananthapuramu',
        tier: 2,
      },
      { name: 'Kadapa', tier: 2 },
      { name: 'Ongole', tier: 2 },
      { name: 'Eluru', tier: 2 },
      { name: 'Machilipatnam', tier: 3 },
      { name: 'Chittoor', tier: 2 },
      { name: 'Srikakulam', tier: 2 },
      { name: 'Vizianagaram', tier: 2 },
      { name: 'Nandyal', tier: 2 },
      { name: 'Hindupur', districtSlug: 'sri-sathya-sai', tier: 3 },
      { name: 'Proddatur', districtSlug: 'ysr', tier: 3 },
      { name: 'Tenali', districtSlug: 'guntur', tier: 3 },
      { name: 'Bhimavaram', districtSlug: 'west-godavari', tier: 3 },
      { name: 'Tadepalligudem', districtSlug: 'west-godavari', tier: 3 },
    ],
    premium: [
      {
        citySlug: 'visakhapatnam',
        areas: [
          'MVP Colony',
          'Rushikonda',
          'Beach Road',
          'Siripuram',
          'Lawsons Bay Colony',
          'Seethammadhara',
          'Madhurawada',
          'PM Palem',
          'Gajuwaka',
        ],
      },
      {
        citySlug: 'vijayawada',
        areas: ['Benz Circle', 'Labbipet', 'Gunadala', 'Tadepalli', 'Mangalagiri', 'Amaravati'],
      },
      {
        citySlug: 'guntur',
        areas: ['Tadepalli', 'Mangalagiri', 'Amaravati'],
      },
    ],
  },
  'st-telangana': {
    cities: [
      { name: 'Hyderabad', tier: 1 },
      { name: 'Warangal', tier: 2 },
      { name: 'Karimnagar', tier: 2 },
      { name: 'Khammam', tier: 2 },
      { name: 'Nizamabad', tier: 2 },
      { name: 'Ramagundam', districtSlug: 'peddapalli', tier: 3 },
      {
        name: 'Mahabubnagar',
        aliases: ['mahbubnagar'],
        districtSlug: 'mahabubnagar',
        tier: 2,
      },
      { name: 'Nalgonda', tier: 2 },
      { name: 'Siddipet', tier: 2 },
      { name: 'Adilabad', tier: 2 },
      { name: 'Sangareddy', tier: 2 },
      { name: 'Medak', tier: 2 },
      { name: 'Suryapet', tier: 2 },
    ],
    premium: [
      {
        citySlug: 'hyderabad',
        areas: [
          'Jubilee Hills',
          'Banjara Hills',
          'Gachibowli',
          'Hitech City',
          'Financial District',
          'Kokapet',
          'Narsingi',
          'Kondapur',
          'Madhapur',
          'Manikonda',
          'Tellapur',
          'Puppalaguda',
          'Begumpet',
          'Somajiguda',
          'Secunderabad',
          'Kompally',
          'Miyapur',
        ],
      },
    ],
  },
  'st-karnataka': {
    cities: [
      { name: 'Bengaluru', tier: 1 },
      { name: 'Mysuru', tier: 1 },
      { name: 'Mangaluru', tier: 2 },
      { name: 'Hubballi', tier: 2 },
      { name: 'Dharwad', districtSlug: 'dharwada', tier: 2 },
      { name: 'Belagavi', tier: 2 },
      { name: 'Ballari', tier: 2 },
      { name: 'Shivamogga', tier: 2 },
      {
        name: 'Davanagere',
        aliases: ['davangere'],
        districtSlug: 'davangere',
        tier: 2,
      },
      { name: 'Tumakuru', tier: 2 },
      { name: 'Udupi', tier: 2 },
      { name: 'Hassan', tier: 2 },
      { name: 'Kalaburagi', tier: 2 },
      { name: 'Vijayapura', tier: 2 },
    ],
    premium: [
      {
        citySlug: 'bengaluru',
        areas: [
          'Whitefield',
          'Indiranagar',
          'Koramangala',
          'Jayanagar',
          'JP Nagar',
          'HSR Layout',
          'Electronic City',
          'Sarjapur Road',
          'Bellandur',
          'Marathahalli',
          'Yelahanka',
          'Hebbal',
          'Sadashivanagar',
          'Malleshwaram',
          'Rajajinagar',
          'Richmond Town',
          'Lavelle Road',
          'Cunningham Road',
        ],
      },
    ],
  },
  'st-kerala': {
    cities: [
      { name: 'Thiruvananthapuram', tier: 1 },
      { name: 'Kochi', tier: 1 },
      { name: 'Kozhikode', tier: 2 },
      { name: 'Thrissur', tier: 2 },
      { name: 'Kollam', tier: 2 },
      { name: 'Alappuzha', tier: 2 },
      { name: 'Kannur', tier: 2 },
      { name: 'Kottayam', tier: 2 },
      { name: 'Palakkad', tier: 2 },
      { name: 'Malappuram', tier: 2 },
      { name: 'Kasaragod', tier: 2 },
    ],
    premium: [
      {
        citySlug: 'thiruvananthapuram',
        areas: ['Kowdiar', 'Vellayambalam', 'Kazhakkoottam'],
      },
      {
        citySlug: 'kochi',
        areas: [
          'Kakkanad',
          'Marine Drive',
          'Panampilly Nagar',
          'Kadavanthra',
          'Edappally',
          'Vyttila',
          'Kaloor',
          'Thripunithura',
          'Fort Kochi',
        ],
      },
    ],
  },
  'st-tamil-nadu': {
    cities: [
      { name: 'Chennai', tier: 1 },
      { name: 'Coimbatore', tier: 1 },
      { name: 'Madurai', tier: 1 },
      { name: 'Tiruchirappalli', tier: 2 },
      { name: 'Salem', tier: 2 },
      { name: 'Tiruppur', tier: 2 },
      { name: 'Erode', tier: 2 },
      { name: 'Vellore', tier: 2 },
      { name: 'Hosur', districtSlug: 'krishnagiri', tier: 2 },
      { name: 'Tirunelveli', tier: 2 },
      { name: 'Thanjavur', tier: 2 },
      { name: 'Dindigul', tier: 2 },
      { name: 'Nagercoil', districtSlug: 'kanniyakumari', tier: 2 },
      { name: 'Cuddalore', tier: 2 },
      { name: 'Kanchipuram', tier: 2 },
    ],
    premium: [
      {
        citySlug: 'chennai',
        areas: [
          'Boat Club Road',
          'Poes Garden',
          'Anna Nagar',
          'Adyar',
          'Besant Nagar',
          'Velachery',
          'OMR',
          'ECR',
          'T Nagar',
          'Nungambakkam',
          'Alwarpet',
          'Mylapore',
          'Sholinganallur',
          'Perungudi',
          'Siruseri',
          'Porur',
          'Guindy',
          'Neelankarai',
          'Injambakkam',
        ],
      },
    ],
  },
};

const AREA_ALIASES: Record<string, readonly string[]> = {
  'lawsons-bay-colony': ['lawsons-bay', 'lawsons-bay-colony'],
  'hitech-city': ['hitech-city', 'hi-tech-city'],
  kazhakkoottam: ['kazhakkoottam', 'kazhakootam'],
  thripunithura: ['thripunithura', 'thrippunithura'],
  omr: ['omr', 'old-mahabalipuram-road'],
  ecr: ['ecr', 'east-coast-road'],
  't-nagar': ['t-nagar', 'thyagaraya-nagar'],
};

const citiesPath = resolve('data/cities.json');
const areasPath = resolve('data/areas.json');
const localitiesPath = resolve('data/city-localities.json');
const districtsPath = resolve('data/districts.json');
const statesPath = resolve('data/states.json');

const cities = citiesFileSchema.parse(JSON.parse(readFileSync(citiesPath, 'utf8')));
const areas = areasFileSchema.parse(JSON.parse(readFileSync(areasPath, 'utf8')));
const districts = JSON.parse(readFileSync(districtsPath, 'utf8')) as District[];
const states = JSON.parse(readFileSync(statesPath, 'utf8')) as State[];
const localities = JSON.parse(readFileSync(localitiesPath, 'utf8')) as Record<
  string,
  { name: string; slug?: string }[]
>;

const stateById = new Map(states.map((state) => [state.id, state]));
const districtByStateSlug = new Map<string, District[]>();
for (const district of districts) {
  const bucket = districtByStateSlug.get(district.stateId) ?? [];
  bucket.push(district);
  districtByStateSlug.set(district.stateId, bucket);
}

function findCity(stateId: string, name: string, aliases: readonly string[] = []): City | undefined {
  const slug = slugify(name);
  const keys = new Set([slug, ...aliases.map((alias) => slugify(alias))]);
  return cities.find(
    (city) =>
      city.stateId === stateId &&
      (keys.has(city.slug) || keys.has(slugify(city.name))),
  );
}

function resolveDistrict(
  stateId: string,
  cityName: string,
  districtSlug?: string,
): District | undefined {
  const list = districtByStateSlug.get(stateId) ?? [];
  if (districtSlug) {
    const exact = list.find((district) => district.slug === districtSlug);
    if (exact) return exact;
  }
  const citySlug = slugify(cityName);
  return (
    list.find((district) => district.slug === citySlug) ||
    list.find((district) => slugify(district.headquarters) === citySlug) ||
    list.find((district) => slugify(district.name) === citySlug) ||
    list.find((district) => district.slug.includes(citySlug)) ||
    list.find((district) => citySlug.includes(district.slug))
  );
}

const STATE_PIN: Record<string, readonly [number, number]> = {
  'st-telangana': [500, 509],
  'st-andhra-pradesh': [515, 535],
  'st-karnataka': [560, 591],
  'st-tamil-nadu': [600, 643],
  'st-kerala': [670, 695],
};

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pinPrefixes(stateId: string, slug: string): string[] {
  const range = STATE_PIN[stateId] ?? [500, 509];
  const [lo, hi] = range;
  return [String(lo + (hashString(slug) % (hi - lo + 1))).padStart(3, '0')];
}

function buildCity(
  state: State,
  district: District,
  name: string,
  slug: string,
  tier: 1 | 2 | 3,
): City {
  const traits = [...state.traits] as TraitKey[];
  const builtForm =
    tier === 1 && state.traits.includes('highRise')
      ? 'high-rise'
      : tier === 3
        ? state.coastal
          ? 'mixed'
          : 'independent-houses'
        : 'mid-rise';

  return {
    id: `ct-${slug}`,
    slug,
    name,
    stateId: state.id,
    districtId: district.id,
    tier,
    traits,
    builtForm,
    intro: `${name} in ${district.name} district, ${state.name}, is a priority service city for balcony safety, invisible grills, and netting. ${
      state.coastal
        ? 'Coastal air and monsoon wetting push specifications toward marine-grade stainless and drained terminations'
        : state.traits.includes('arid')
          ? 'The inland climate makes ultraviolet exposure and wind on open balconies the main material concerns'
          : 'Local humidity and monsoon patterns shape net twine choice and post-season inspection advice'
    }. Surveys follow building stock around ${district.headquarters}, society access rules, and practical working windows for apartments and houses.`,
    localConsiderations: `Installations in ${name} are planned around access near ${district.headquarters}, association permissions, and ${
      state.coastal ? 'salt and monsoon exposure' : 'heat and UV on open elevations'
    }.`,
    landmarks: [
      `${name} bus stand`,
      `${district.name} collectorate`,
      `${name} market area`,
      `${district.headquarters} town limits`,
    ],
    pincodePrefixes: pinPrefixes(state.id, slug),
    neighbouringCityIds: [],
    published: true,
  };
}

function areaExists(cityId: string, areaName: string): boolean {
  const slug = slugify(areaName);
  const aliases = new Set([slug, ...(AREA_ALIASES[slug] ?? [])]);
  return areas.some(
    (area) =>
      area.cityId === cityId &&
      (aliases.has(area.slug) || slugify(area.name) === slug),
  );
}

function mapBuiltForm(cityBuiltForm: City['builtForm']): Area['builtForm'] {
  if (cityBuiltForm === 'high-rise') return 'high-rise';
  if (cityBuiltForm === 'independent-houses') return 'independent-houses';
  return 'mixed';
}

function areaIdPrefix(cityId: string): string {
  const sample = areas.find((area) => area.cityId === cityId);
  if (sample) {
    const parts = sample.id.split('-');
    if (parts[0] === 'ar' && parts.length >= 3) return `ar-${parts[1]}-`;
  }
  const city = cities.find((entry) => entry.id === cityId);
  const code = (city?.slug.replace(/-/gu, '').slice(0, 3) || 'loc').slice(0, 3);
  return `ar-${code}-`;
}

const newCities: City[] = [];
const upgraded: string[] = [];
const unresolvedCities: string[] = [];

for (const [stateId, pack] of Object.entries(WANTED)) {
  const state = stateById.get(stateId);
  if (!state) continue;

  for (const entry of pack.cities) {
    const existing = findCity(stateId, entry.name, entry.aliases ?? []);
    if (existing) {
      if (entry.tier && existing.tier > entry.tier) {
        const index = cities.findIndex((city) => city.id === existing.id);
        if (index >= 0) {
          cities[index] = { ...existing, tier: entry.tier };
          upgraded.push(`${existing.slug}→tier ${entry.tier}`);
        }
      }
      // Prefer curated display names from the market list.
      if (existing.name !== entry.name) {
        const index = cities.findIndex((city) => city.id === existing.id);
        if (index >= 0) {
          cities[index] = { ...cities[index]!, name: entry.name };
          upgraded.push(`${existing.slug} renamed ${entry.name}`);
        }
      }
      continue;
    }

    const slug = entry.slug ?? slugify(entry.name);
    if (cities.some((city) => city.slug === slug) || newCities.some((city) => city.slug === slug)) {
      unresolvedCities.push(`${entry.name} (slug taken)`);
      continue;
    }

    const district = resolveDistrict(stateId, entry.name, entry.districtSlug);
    if (!district) {
      unresolvedCities.push(`${entry.name} (no district)`);
      continue;
    }

    // Prefer attaching to an unused district; if district already has a city,
    // still add this named market city (multi-city districts are allowed).
    newCities.push(buildCity(state, district, entry.name, slug, entry.tier ?? 3));
  }
}

const mergedCities = [...cities, ...newCities];

/** Keep neighbours wired for any brand-new cities. */
function wireNewNeighbours(all: City[]): City[] {
  const byState = new Map<string, City[]>();
  for (const city of all) {
    if (!city.published) continue;
    const bucket = byState.get(city.stateId) ?? [];
    bucket.push(city);
    byState.set(city.stateId, bucket);
  }

  return all.map((city) => {
    if (!newCities.some((entry) => entry.id === city.id) && city.neighbouringCityIds.length > 0) {
      return city;
    }
    const peers = (byState.get(city.stateId) ?? [])
      .filter((peer) => peer.id !== city.id)
      .sort((a, b) => a.slug.localeCompare(b.slug));
    const start = peers.length === 0 ? 0 : hashString(city.slug) % peers.length;
    const picked: string[] = [];
    for (let i = 0; i < peers.length && picked.length < 5; i += 1) {
      picked.push(peers[(start + i) % peers.length]!.id);
    }
    return { ...city, neighbouringCityIds: picked };
  });
}

const finalCities = wireNewNeighbours(mergedCities);
const cityById = new Map(finalCities.map((city) => [city.id, city]));
const cityByStateSlug = new Map(
  finalCities.map((city) => [`${city.stateId}:${city.slug}`, city] as const),
);

const newAreas: Area[] = [];
const missingPremium: string[] = [];
const existingIds = new Set(areas.map((area) => area.id));
const existingSlugsByCity = new Map<string, Set<string>>();
for (const area of areas) {
  const set = existingSlugsByCity.get(area.cityId) ?? new Set();
  set.add(area.slug);
  existingSlugsByCity.set(area.cityId, set);
}

for (const [stateId, pack] of Object.entries(WANTED)) {
  for (const group of pack.premium) {
    const aliases = group.cityAliases ?? [];
    let city =
      cityByStateSlug.get(`${stateId}:${group.citySlug}`) ||
      finalCities.find(
        (entry) =>
          entry.stateId === stateId &&
          (entry.slug === group.citySlug || aliases.includes(entry.slug)),
      );

    // Davanagere alias
    if (!city && group.citySlug === 'davanagere') {
      city = finalCities.find(
        (entry) => entry.stateId === stateId && entry.slug === 'davangere',
      );
    }

    if (!city) {
      missingPremium.push(`${group.citySlug}: city missing`);
      continue;
    }

    const prefix = areaIdPrefix(city.id);
    const slugs = existingSlugsByCity.get(city.id) ?? new Set();
    existingSlugsByCity.set(city.id, slugs);
    const localityBucket = localities[city.id] ?? [];

    for (const areaName of group.areas) {
      if (areaExists(city.id, areaName)) {
        if (!localityBucket.some((entry) => slugify(entry.name) === slugify(areaName))) {
          localityBucket.push({ name: areaName });
        }
        continue;
      }

      const slug = slugify(areaName);
      if (!slug || slugs.has(slug)) continue;

      const id = `${prefix}${slug}`;
      if (existingIds.has(id)) continue;

      const row: Area = {
        id,
        slug,
        name: areaName,
        cityId: city.id,
        profile: 'mixed',
        builtForm: mapBuiltForm(city.builtForm),
        traits: [...city.traits],
        notes: `${areaName} in ${city.name} is a high-demand residential pocket for balcony safety, invisible grills, and netting after handover or renovation.`,
        landmarks: [
          `${areaName} main road`,
          `${city.name} city limits`,
          `${areaName} residential belt`,
        ],
        adjacentAreaIds: [],
        published: true,
      };
      areaSchema.parse(row);
      newAreas.push(row);
      existingIds.add(id);
      slugs.add(slug);
      localityBucket.push({ name: areaName });
    }

    localities[city.id] = localityBucket;
  }
}

/** Ring-wire adjacency for cities that received new premium areas. */
function wireAdjacency(all: Area[]): Area[] {
  const touchedCityIds = new Set(newAreas.map((area) => area.cityId));
  if (touchedCityIds.size === 0) return all;

  const byCity = new Map<string, Area[]>();
  for (const area of all) {
    if (!area.published || !touchedCityIds.has(area.cityId)) continue;
    const bucket = byCity.get(area.cityId) ?? [];
    bucket.push(area);
    byCity.set(area.cityId, bucket);
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

  return all.map((area) => {
    const wired = nextAdj.get(area.id);
    if (!wired) return area;
    const merged = [...new Set([...(area.adjacentAreaIds ?? []), ...wired])].slice(0, 8);
    return { ...area, adjacentAreaIds: merged };
  });
}

const mergedAreas = wireAdjacency([...areas, ...newAreas]);

console.log(`\nSync premium geo${dryRun ? ' (dry run)' : ''}\n`);
console.log(`  New cities     : ${newCities.length}`);
for (const city of newCities) {
  const state = stateById.get(city.stateId);
  console.log(`    + ${city.name} (${state?.slug})`);
}
console.log(`  Tier/name bumps: ${upgraded.length}`);
for (const row of upgraded) console.log(`    ~ ${row}`);
console.log(`  New premium areas: ${newAreas.length}`);
for (const area of newAreas) {
  console.log(`    + ${cityById.get(area.cityId)?.slug}/${area.slug}`);
}
if (unresolvedCities.length) {
  console.log(`  Unresolved cities: ${unresolvedCities.length}`);
  for (const row of unresolvedCities) console.log(`    ! ${row}`);
}
if (missingPremium.length) {
  console.log(`  Premium city misses: ${missingPremium.length}`);
  for (const row of missingPremium) console.log(`    ! ${row}`);
}

if (dryRun) {
  console.log('\nDry run — files not modified.\n');
  process.exit(0);
}

citiesFileSchema.parse(finalCities);
areasFileSchema.parse(mergedAreas);
writeFileSync(citiesPath, `${JSON.stringify(finalCities, null, 2)}\n`, 'utf8');
writeFileSync(areasPath, `${JSON.stringify(mergedAreas, null, 2)}\n`, 'utf8');
writeFileSync(localitiesPath, `${JSON.stringify(localities, null, 2)}\n`, 'utf8');

console.log(`\nWrote cities (${finalCities.length}), areas (${mergedAreas.length}), localities\n`);
