/**
 * Generate Service × Location keyword/SEO packages from the 11-tier catalog.
 *
 *   npx tsx scripts/generate-keyword-packages.ts --city=hyderabad
 *   npx tsx scripts/generate-keyword-packages.ts --city=hyderabad --areas --limit=20
 *   npx tsx scripts/generate-keyword-packages.ts --city=chennai --service=invisible-grills
 *   npx tsx scripts/generate-keyword-packages.ts --city=bengaluru --out=keywords/packages-bengaluru.json
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
  getCities,
  getCityBySlug,
  getStates,
} from '../lib/data/repository';
import { buildKeywordPackagesForCity } from '../lib/seo/keyword-package';

const args = process.argv.slice(2);
const cityArg = args.find((arg) => arg.startsWith('--city='))?.slice('--city='.length);
const serviceArg = args.find((arg) => arg.startsWith('--service='))?.slice('--service='.length);
const outArg = args.find((arg) => arg.startsWith('--out='))?.slice('--out='.length);
const limit = Number(args.find((arg) => arg.startsWith('--limit='))?.split('=')[1] ?? '0');
const includeAreas = args.includes('--areas');
const flat = args.includes('--flat');

if (!cityArg) {
  console.error(
    'Usage: npx tsx scripts/generate-keyword-packages.ts --city=<slug> [--areas] [--service=<slug>] [--limit=N] [--flat] [--out=path]',
  );
  console.error(
    `Cities: ${getCities()
      .filter((city) => city.tier <= 2)
      .slice(0, 20)
      .map((city) => city.slug)
      .join(', ')}…`,
  );
  process.exit(1);
}

let city = getCities().find((entry) => entry.slug === cityArg);
if (!city) {
  // try across states
  for (const state of getStates()) {
    city = getCityBySlug(state.id, cityArg);
    if (city) break;
  }
}

if (!city) {
  console.error(`Unknown city slug: ${cityArg}`);
  process.exit(1);
}

let packages = [...buildKeywordPackagesForCity(city, {
  includeAreas,
  ...(serviceArg ? { serviceSlugs: [serviceArg] } : {}),
})];

if (limit > 0) packages = packages.slice(0, limit);

const outPath = resolve(
  outArg ??
    `keywords/packages-${city.slug}${includeAreas ? '-areas' : ''}${serviceArg ? `-${serviceArg}` : ''}.json`,
);

mkdirSync(dirname(outPath), { recursive: true });

if (flat) {
  const rows = packages.flatMap((pack) =>
    pack.phrases.map((phrase) => ({
      service: pack.serviceName,
      location: pack.locationLabel,
      phrase: phrase.phrase,
      tier: phrase.tier,
      bucket: phrase.bucket,
      intent: phrase.intentSlug ?? '',
      buyingIntent: phrase.buyingIntent,
      commercialIntent: phrase.commercialIntent,
      localIntent: phrase.localIntent,
      url: phrase.suggestedUrl,
      primaryKeyword: pack.primaryKeyword,
      seoTitle: pack.seoTitle,
      h1: pack.h1,
    })),
  );
  // de-dupe flat phrases
  const seen = new Set<string>();
  const uniqueRows = rows.filter((row) => {
    const key = `${row.service}|${row.location}|${row.phrase.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  writeFileSync(outPath, `${JSON.stringify(uniqueRows, null, 2)}\n`, 'utf8');
  console.log(`\nWrote ${uniqueRows.length} flat keyword rows → ${outPath}\n`);
} else {
  writeFileSync(outPath, `${JSON.stringify(packages, null, 2)}\n`, 'utf8');
  const phraseCount = packages.reduce((sum, pack) => sum + pack.phrases.length, 0);
  console.log(`\nKeyword packages\n`);
  console.log(`  City       : ${city.name}`);
  console.log(`  Packages   : ${packages.length}`);
  console.log(`  Phrases    : ${phraseCount}`);
  console.log(`  With areas : ${includeAreas}`);
  console.log(`  Output     : ${outPath}\n`);
  if (packages[0]) {
    console.log('Sample primary:', packages[0].primaryKeyword);
    console.log('Sample URL    :', packages[0].suggestedUrl);
    console.log('Sample title  :', packages[0].seoTitle);
  }
  console.log('');
}
