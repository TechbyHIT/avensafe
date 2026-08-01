/**

 * Reports how a list of search phrases maps to canonical URLs.

 *

 * Usage:

 *   npm run report:keywords -- keywords.txt

 *   npm run report:keywords   (runs built-in sample)

 */

import { readFileSync } from 'node:fs';

import { getCities } from '../lib/data/repository';

import { listMissingIntentSlugs, resolveKeywordPhrase } from '../lib/seo/keyword-resolver';



const args = process.argv.slice(2);

let phrases: string[];



if (args[0]) {

  phrases = readFileSync(args[0], 'utf8')

    .split(/\r?\n/u)

    .map((line) => line.trim())

    .filter((line) => line.length > 0);

} else {

  phrases = [

    'invisible grills in gachibowli hyderabad',

    'invisible grill installation in kondapur hyderabad',

    'balcony invisible grills in banjara hills hyderabad',

    'invisible grills price',

    'safety net company in secunderabad hyderabad',

    'child safety nets in habsiguda hyderabad',

    'cloth hanger installation in miyapur hyderabad',

    'cricket practice nets in madhapur hyderabad',

    'sports net price in uppal hyderabad',

  ];

}



let full = 0;

let alias = 0;

let unmapped = 0;

let areaTier = 0;

let cityTier = 0;

let noLocation = 0;



for (const phrase of phrases) {

  const result = resolveKeywordPhrase(phrase);

  if (result.coverage === 'full') full += 1;

  else if (result.coverage === 'alias-only') alias += 1;

  else unmapped += 1;



  if (result.locationTier === 'area') areaTier += 1;

  else if (result.locationTier === 'city') cityTier += 1;

  else noLocation += 1;

}



console.log('\nKeyword coverage report');

console.log(`  phrases parsed : ${phrases.length}`);

console.log(`  full intent    : ${full}`);

console.log(`  alias / base   : ${alias}`);

console.log(`  unmapped       : ${unmapped}`);

console.log(`  area URL tier  : ${areaTier} (published area in data)`);

console.log(`  city URL tier  : ${cityTier} (locality in phrase, area not published)`);

console.log(`  no location    : ${noLocation}`);

console.log(`  cities in data : ${getCities().length}`);



const missing = listMissingIntentSlugs();

if (missing.length > 0) {

  console.log(`\nPublished intents still missing for modifiers: ${missing.join(', ')}`);

}



const samples = phrases.slice(0, 15);

console.log('\nSample mappings:\n');

for (const phrase of samples) {

  const result = resolveKeywordPhrase(phrase);

  const target =

    result.examplePath ??

    (result.service ? `/…/${result.service.slug}` : '(none)');

  const loc =

    result.locationTier === 'area' && result.area

      ? ` [area: ${result.area.slug}]`

      : result.locationTier === 'city' && result.locality

        ? ` [locality: ${result.locality} → city rollup]`

        : '';

  console.log(`  • "${phrase}"`);

  console.log(`      → ${target}${loc}${result.note ? ` — ${result.note}` : ''}`);

}



if (unmapped > 0) {

  console.log('\nUnmapped examples (first 20):\n');

  let shown = 0;

  for (const phrase of phrases) {

    const result = resolveKeywordPhrase(phrase);

    if (result.coverage === 'unmapped') {

      console.log(`  • ${phrase}`);

      shown += 1;

      if (shown >= 20) break;

    }

  }

}



console.log('');

