/**
 * Generates natural commercial/local keyword phrases from the modifier catalog
 * × published geo inventory. Synonym stacking and unnatural pairs are skipped.
 *
 *   npx tsx scripts/generate-keyword-corpus.ts
 *   npx tsx scripts/generate-keyword-corpus.ts --limit=5000
 *   npx tsx scripts/generate-keyword-corpus.ts --out=keywords/generated-corpus.txt
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
  KEYWORD_MODIFIERS,
  SERVICE_KEYWORD_ROOTS,
  UNNATURAL_MODIFIER_PAIRS,
} from '../config/keyword-modifiers';
import {
  getAreasByCity,
  getCities,
  getDistrictById,
  getStates,
} from '../lib/data/repository';

const limit = Number(
  process.argv.find((arg) => arg.startsWith('--limit='))?.split('=')[1] ?? '8000',
);
const outPath = resolve(
  process.argv.find((arg) => arg.startsWith('--out='))?.split('=')[1] ??
    'keywords/generated-corpus.txt',
);

const pageModifiers = KEYWORD_MODIFIERS.filter((modifier) => modifier.mintPage !== false);

function unnatural(a: string, b: string): boolean {
  return UNNATURAL_MODIFIER_PAIRS.some(
    ([left, right]) =>
      (left === a && right === b) || (left === b && right === a),
  );
}

function primaryProductPhrase(root: (typeof SERVICE_KEYWORD_ROOTS)[number]): string {
  return root.phrases[0] ?? root.label.toLowerCase();
}

const phrases = new Set<string>();

function add(phrase: string): void {
  const normalized = phrase.replace(/\s+/gu, ' ').trim();
  if (!normalized) return;
  phrases.add(normalized);
}

const states = getStates().filter((state) => state.published);
const cities = getCities().filter((city) => city.published && city.tier <= 2);

// Core patterns from the prompt examples.
for (const root of SERVICE_KEYWORD_ROOTS) {
  const product = primaryProductPhrase(root);
  add(product);
  add(`best ${product}`);
  add(`top ${product} near me`);
  add(`${product} installation`);
  add(`${product} price`);
  add(`affordable ${product}`);
  add(`premium ${product}`);
  add(`top rated ${product} installation near me`);
  add(`reliable ${product} dealers`);
  add(`best ${product} company`);

  if (root.defaultIntentSlug) {
    const intentMod = pageModifiers.find((row) => row.intentSlug === root.defaultIntentSlug);
    if (intentMod) add(`${intentMod.label.toLowerCase()} ${product}`);
  }

  for (const modifier of pageModifiers) {
    if (modifier.serviceSlugs && !modifier.serviceSlugs.includes(root.serviceSlug)) continue;
    if (unnatural(modifier.intentSlug, root.defaultIntentSlug ?? '')) continue;

    const label = modifier.label.toLowerCase();
    // Prefer natural word order variants only.
    if (modifier.group === 'quality' || modifier.group === 'buying') {
      add(`${label} ${product}`);
    } else if (modifier.group === 'service' || modifier.group === 'local') {
      add(`${product} ${label}`);
    } else if (modifier.group === 'feature' || modifier.group === 'audience') {
      add(`${label} ${product}`);
      add(`${product} ${label}`);
    } else if (modifier.group === 'property') {
      add(`${product} for ${label.replace(/^for\s+/u, '')}`);
    }
  }
}

// Geo combinations: priority cities + a sample of premium areas.
for (const city of cities) {
  const state = states.find((entry) => entry.id === city.stateId);
  const district = city.districtId ? getDistrictById(city.districtId) : undefined;
  const areas = getAreasByCity(city.id)
    .filter((area) => area.published)
    .slice(0, city.tier === 1 ? 12 : 6);

  for (const root of SERVICE_KEYWORD_ROOTS) {
    const product = primaryProductPhrase(root);
    add(`${product} in ${city.name}`);
    add(`best ${product} in ${city.name}`);
    add(`${product} price in ${city.name}`);
    add(`${product} installation in ${city.name}`);
    add(`${product} near me ${city.name}`);
    add(`best ${product} company in ${city.name}`);
    if (state) add(`${product} in ${state.name}`);
    if (district) add(`${product} in ${district.name} district`);

    for (const area of areas) {
      add(`${product} in ${area.name}`);
      add(`best ${product} in ${area.name}`);
      add(`${product} installation in ${area.name}`);
      add(`affordable ${product} in ${area.name}`);
      add(`${product} near ${area.name}`);

      // Landmark-style from area landmarks when present.
      for (const landmark of area.landmarks.slice(0, 1)) {
        add(`${product} near ${landmark}`);
      }
    }

    // A few dual-modifier natural combos only.
    add(`best ${product} installation in ${city.name}`);
    add(`top rated ${product} near me`);
    add(`stainless steel ${product} in ${city.name}`);
  }
}

const sorted = [...phrases].sort((a, b) => a.localeCompare(b));
const limited = sorted.slice(0, Math.max(100, limit));

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${limited.join('\n')}\n`, 'utf8');

console.log(`\nKeyword corpus\n`);
console.log(`  Unique natural phrases : ${sorted.length}`);
console.log(`  Written                : ${limited.length}`);
console.log(`  Output                 : ${outPath}\n`);
console.log('Sample:');
for (const phrase of limited.slice(0, 12)) console.log(`  • ${phrase}`);
console.log('');
