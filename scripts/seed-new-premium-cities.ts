/**
 * Seeds localities + areas for cities added by sync-premium-geo.ts.
 *
 *   npx tsx scripts/seed-new-premium-cities.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const NEW_CITY_SLUGS = [
  'hindupur',
  'proddatur',
  'tenali',
  'tadepalligudem',
  'ramagundam',
  'dharwad',
  'hosur',
] as const;

const STEMS = [
  'Town Center',
  'Old Town',
  'New Colony',
  'Market Area',
  'Railway Station Area',
  'Bus Stand Road',
  'Collectorate Road',
  'Industrial Estate',
  'Housing Board Colony',
  'Bypass Road',
  'Gandhi Nagar',
  'Nehru Nagar',
  'Sai Nagar',
  'Teachers Colony',
  'Vidya Nagar',
  'Ashok Nagar',
  'Shanti Nagar',
  'Lakshmi Nagar',
  'Ambedkar Nagar',
  'Indira Nagar',
  'Subhash Nagar',
  'Patel Nagar',
  'Krishna Nagar',
  'Ram Nagar',
  'Auto Nagar',
  'Stadium Road',
  'Hospital Road',
  'Court Road',
] as const;

const citiesPath = resolve('data/cities.json');
const localitiesPath = resolve('data/city-localities.json');

const cities = JSON.parse(readFileSync(citiesPath, 'utf8')) as {
  id: string;
  slug: string;
  name: string;
}[];
const localities = JSON.parse(readFileSync(localitiesPath, 'utf8')) as Record<
  string,
  { name: string }[]
>;

for (const slug of NEW_CITY_SLUGS) {
  const city = cities.find((entry) => entry.slug === slug);
  if (!city) {
    console.warn(`Missing city: ${slug}`);
    continue;
  }
  localities[city.id] = STEMS.map((stem, index) => ({
    name: index < 4 ? `${city.name} ${stem}` : stem,
  }));
  console.log(`Localities for ${city.name}: ${localities[city.id]!.length}`);
}

writeFileSync(localitiesPath, `${JSON.stringify(localities, null, 2)}\n`, 'utf8');

const result = spawnSync('npx', ['tsx', 'scripts/seed-city-localities.ts'], {
  stdio: 'inherit',
  shell: true,
});
process.exit(result.status ?? 1);
