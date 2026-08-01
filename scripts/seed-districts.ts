/**
 * Builds data/districts.json from the India districts source dump and links
 * each city to a district via districtId.
 *
 *   npx tsx scripts/seed-districts.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { slugify } from '../lib/utils/text';

type SourceDistrict = {
  state: string;
  stateCode: string;
  districtCode: string;
  district: string;
  headquarters: string;
};

type StateRow = { id: string; slug: string; code: string; name: string };
type CityRow = {
  id: string;
  slug: string;
  name: string;
  stateId: string;
  districtId?: string;
  [key: string]: unknown;
};

/** Source uses TS for Telangana; our states.json uses TG. */
const SOURCE_CODE_TO_OURS: Record<string, string> = {
  AP: 'AP',
  TS: 'TG',
  TG: 'TG',
  KA: 'KA',
  KL: 'KL',
  TN: 'TN',
  MH: 'MH',
  OD: 'OD',
  GA: 'GA',
};

/** Manual overrides when city slug ≠ district / HQ slug. */
const CITY_DISTRICT_SLUG: Record<string, string> = {
  'ct-bengaluru': 'bengaluru-urban',
  'ct-mumbai': 'mumbai-city',
  'ct-navi-mumbai': 'thane',
  'ct-thane': 'thane',
  'ct-pune': 'pune',
  'ct-nagpur': 'nagpur',
  'ct-nashik': 'nashik',
  'ct-aurangabad': 'aurangabad',
  'ct-thiruvananthapuram': 'thiruvananthapuram',
  'ct-kochi': 'ernakulam',
  'ct-kozhikode': 'kozhikode',
  'ct-thrissur': 'thrissur',
  'ct-kannur': 'kannur',
  'ct-mysuru': 'mysuru',
  'ct-mangaluru': 'dakshina-kannada',
  'ct-hubballi': 'dharwada',
  'ct-hubballi-dharwad': 'dharwada',
  'ct-belagavi': 'belagavi',
  'ct-visakhapatnam': 'visakhapatnam',
  'ct-vijayawada': 'ntr',
  'ct-guntur': 'palnadu',
  'ct-nellore': 'sri-potti-sriramulu-nellore',
  'ct-kurnool': 'kurnool',
  'ct-tirupati': 'tirupati',
  'ct-rajahmundry': 'east-godavari',
  'ct-chennai': 'chennai',
  'ct-coimbatore': 'coimbatore',
  'ct-madurai': 'madurai',
  'ct-tiruchirappalli': 'tiruchirappalli',
  'ct-salem': 'salem',
  'ct-tiruppur': 'tiruppur',
  'ct-hosur': 'krishnagiri',
  'ct-hyderabad': 'hyderabad',
  'ct-warangal': 'hanumakonda',
  'ct-nizamabad': 'nizamabad',
  'ct-karimnagar': 'karimnagar',
  'ct-khammam': 'khammam',
  'ct-bhubaneswar': 'khordha',
  'ct-cuttack': 'cuttack',
  'ct-rourkela': 'sundargarh',
  'ct-berhampur': 'ganjam',
  'ct-sambalpur': 'sambalpur',
  'ct-panaji': 'north-goa',
  'ct-margao': 'south-goa',
  'ct-vasco-da-gama': 'south-goa',
  'ct-mapusa': 'north-goa',
};

function paragraphFor(name: string, stateName: string, hq: string): string {
  return (
    `${name} district in ${stateName} covers the administrative area around ${hq}, ` +
    `including urban centres and surrounding settlements where balcony safety, ` +
    `window protection, and netting specifications follow local building stock and climate.`
  );
}

function main(): void {
  const sourcePath = resolve('data/raw/india-districts-source.json');
  const source = JSON.parse(readFileSync(sourcePath, 'utf8')) as {
    districts: SourceDistrict[];
  };
  const states = JSON.parse(readFileSync(resolve('data/states.json'), 'utf8')) as StateRow[];
  const cities = JSON.parse(readFileSync(resolve('data/cities.json'), 'utf8')) as CityRow[];

  const stateByCode = new Map(states.map((s) => [s.code, s]));

  const districts = source.districts
    .map((row) => {
      const code = SOURCE_CODE_TO_OURS[row.stateCode];
      if (!code) return null;
      const state = stateByCode.get(code);
      if (!state) return null;
      const slug = slugify(row.district);
      const id = `di-${state.slug}-${slug}`;
      return {
        id,
        slug,
        name: row.district,
        stateId: state.id,
        headquarters: row.headquarters,
        sourceCode: row.districtCode,
        intro: paragraphFor(row.district, state.name, row.headquarters),
        localConsiderations: `Installations in ${row.district} district are surveyed against local building stock around ${row.headquarters}, association rules in urban pockets, and the climate traits of ${state.name}.`,
        neighbouringDistrictIds: [] as string[],
        published: true,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  // Dedupe by id
  const byId = new Map(districts.map((d) => [d.id, d]));
  const uniqueDistricts = [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));

  const districtByStateAndSlug = new Map(
    uniqueDistricts.map((d) => [`${d.stateId}:${d.slug}`, d]),
  );

  let linked = 0;
  let missing = 0;
  for (const city of cities) {
    const preferred = CITY_DISTRICT_SLUG[city.id] ?? city.slug;
    let district = districtByStateAndSlug.get(`${city.stateId}:${preferred}`);
    if (!district) {
      const list = uniqueDistricts.filter((d) => d.stateId === city.stateId);
      district =
        list.find((d) => d.slug === city.slug) ??
        list.find((d) => slugify(d.headquarters) === city.slug) ??
        list.find((d) => d.slug.includes(city.slug) || city.slug.includes(d.slug));
    }
    if (district) {
      city.districtId = district.id;
      linked += 1;
    } else {
      missing += 1;
      console.warn(`No district for ${city.id} (${city.name})`);
    }
  }

  writeFileSync(
    resolve('data/districts.json'),
    `${JSON.stringify(uniqueDistricts, null, 2)}\n`,
    'utf8',
  );
  writeFileSync(resolve('data/cities.json'), `${JSON.stringify(cities, null, 2)}\n`, 'utf8');

  console.log(
    `Wrote ${uniqueDistricts.length} districts; linked ${linked}/${cities.length} cities (${missing} missing).`,
  );
}

main();
