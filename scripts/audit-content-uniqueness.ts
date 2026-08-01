/**
 * Samples service×location pages and reports fingerprint collisions /
 * specificity failures for the uniqueness gate.
 *
 *   npm run audit:uniqueness
 *   npm run audit:uniqueness -- --limit=40
 */
import { CONTENT_THRESHOLDS } from '../config/constants';
import { buildPageContent } from '../lib/content/engine';
import { getCities, getDistrictById, getServices, getStateById } from '../lib/data/repository';
import { evaluatePublishing } from '../lib/routing/publishing';
import { serviceInCityPath } from '../lib/routing/url';
import type { PageTarget } from '../types/routing';

const limit = Number(process.argv.find((arg) => arg.startsWith('--limit='))?.split('=')[1] ?? '48');

const cities = getCities()
  .filter((city) => city.tier <= 2 && city.published)
  .slice(0, 12);
const services = getServices().slice(0, 4);

const fingerprints = new Map<string, string[]>();
let checked = 0;
let failedGate = 0;
let lowSpecificity = 0;

console.log(`\nContent uniqueness audit (sample up to ${limit} service×city pages)\n`);

outer: for (const city of cities) {
  const state = getStateById(city.stateId);
  if (!state) continue;
  const district = city.districtId ? getDistrictById(city.districtId) : undefined;

  for (const service of services) {
    if (checked >= limit) break outer;
    const path = serviceInCityPath(service, state, city);
    const target = {
      kind: 'serviceInCity' as const,
      path,
      service,
      location: {
        state,
        city,
        ...(district ? { district } : {}),
      },
      traits: [...city.traits],
    } satisfies PageTarget;

    const content = buildPageContent(target);
    const decision = evaluatePublishing(target, content);

    checked += 1;
    if (!decision.indexable) failedGate += 1;
    const ratio = content.wordCount > 0 ? content.specificWordCount / content.wordCount : 0;
    if (ratio < CONTENT_THRESHOLDS.minSpecificityRatio) lowSpecificity += 1;

    const list = fingerprints.get(content.fingerprint) ?? [];
    list.push(path);
    fingerprints.set(content.fingerprint, list);

    if (checked <= 5) {
      console.log(
        `  ${path}\n    words=${content.wordCount} specific%=${(ratio * 100).toFixed(0)} faqs=${content.faqs.length} fp=${content.fingerprint} indexable=${decision.indexable}`,
      );
      console.log(`    h1: ${content.h1}`);
      console.log(`    faq0: ${content.faqs[0]?.question ?? '(none)'}\n`);
    }
  }
}

const collisions = [...fingerprints.entries()].filter(([, paths]) => paths.length > 1);

console.log('Summary');
console.log(`  sampled             : ${checked}`);
console.log(`  failed publish      : ${failedGate}`);
console.log(`  low specificity     : ${lowSpecificity}`);
console.log(`  unique fingerprints : ${fingerprints.size}`);
console.log(`  fingerprint collisions: ${collisions.length}`);
if (collisions.length > 0) {
  console.log('\nCollisions:');
  for (const [fp, paths] of collisions.slice(0, 10)) {
    console.log(`  ${fp}: ${paths.join(' | ')}`);
  }
}
console.log('');

if (collisions.length > 0 || failedGate > checked * 0.25) {
  process.exitCode = 1;
}
