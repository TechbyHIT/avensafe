/**
 * Extracts unique localities from keyword lines like `… in {locality} {city}`.
 *
 * Usage:
 *   npx tsx scripts/extract-localities-from-keywords.ts keywords.txt
 *   npx tsx scripts/extract-localities-from-keywords.ts keywords.txt --json
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { getAreasByCity, getCities } from '../lib/data/repository';
import { normalizeKeywordPhrase, parseLocationFromPhrase } from '../lib/seo/keyword-resolver';
import { slugify } from '../lib/utils/text';

const args = process.argv.slice(2);
const jsonOut = args.includes('--json');
const filePath = args.find((arg) => arg !== '--json');

if (!filePath) {
  console.error('Usage: npx tsx scripts/extract-localities-from-keywords.ts <keywords.txt> [--json]');
  process.exit(1);
}

const lines = readFileSync(filePath, 'utf8')
  .split(/\r?\n/u)
  .map((line) => line.trim())
  .filter((line) => line.length > 0);

interface LocalityAccumulator {
  slug: string;
  name: string;
  count: number;
}

const byCity = new Map<
  string,
  { cityName: string; citySlug: string; localities: Map<string, LocalityAccumulator> }
>();

for (const line of lines) {
  const parsed = parseLocationFromPhrase(normalizeKeywordPhrase(line));
  if (!parsed.city || !parsed.locality) continue;

  const key = parsed.city.id;
  let bucket = byCity.get(key);
  if (!bucket) {
    bucket = {
      cityName: parsed.city.name,
      citySlug: parsed.city.slug,
      localities: new Map(),
    };
    byCity.set(key, bucket);
  }

  const slug = slugify(parsed.locality);
  const existing = bucket.localities.get(slug);
  if (existing) existing.count += 1;
  else bucket.localities.set(slug, { slug, name: parsed.locality, count: 1 });
}

interface LocalityEntry {
  slug: string;
  count: number;
  name: string;
  publishedInData: boolean;
}

const report: Record<
  string,
  {
    cityName: string;
    citySlug: string;
    publishedAreas: number;
    uniqueLocalities: number;
    missingFromData: LocalityEntry[];
  }
> = {};

for (const [cityId, bucket] of byCity) {
  const publishedSlugs = new Set(getAreasByCity(cityId).map((area) => area.slug));
  const entries: LocalityEntry[] = [...bucket.localities.values()].map((entry) => ({
    slug: entry.slug,
    count: entry.count,
    name: entry.name,
    publishedInData: publishedSlugs.has(entry.slug),
  }));

  const missing = entries.filter((entry) => !entry.publishedInData).sort((a, b) => b.count - a.count);

  report[cityId] = {
    cityName: bucket.cityName,
    citySlug: bucket.citySlug,
    publishedAreas: publishedSlugs.size,
    uniqueLocalities: entries.length,
    missingFromData: missing,
  };
}

if (jsonOut) {
  const outPath = filePath.replace(/\.txt$/u, '-localities.json');
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${outPath}`);
} else {
  console.log('\nLocalities extracted from keywords\n');
  for (const row of Object.values(report)) {
    console.log(`${row.cityName} (${row.citySlug})`);
    console.log(`  unique localities in file : ${row.uniqueLocalities}`);
    console.log(`  published areas in data   : ${row.publishedAreas}`);
    console.log(`  not yet in areas.json     : ${row.missingFromData.length}`);
    if (row.missingFromData.length > 0) {
      const preview = row.missingFromData.slice(0, 8).map((entry) => entry.name);
      console.log(`  sample missing            : ${preview.join(', ')}${row.missingFromData.length > 8 ? '…' : ''}`);
    }
    console.log('');
  }
  console.log(`Cities referenced: ${byCity.size} / ${getCities().length} published in data`);
}
