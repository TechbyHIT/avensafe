/**
 * Hard audit: find any gap that could leave a service/area/intent page missing,
 * unlinked, or noindex.
 *
 *   npx tsx scripts/audit-coverage-gaps.ts
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { KEYWORD_MODIFIERS } from '../config/keyword-modifiers';
import { taxonomyServiceIntentPairs } from '../config/service-taxonomy';
import { buildPageContent } from '../lib/content/engine';
import {
  getAreaById,
  getAreas,
  getCities,
  getCityById,
  getDistrictById,
  getSearchIntents,
  getServiceBySlug,
  getServices,
  getStateById,
  getStates,
} from '../lib/data/repository';
import { intentAppliesToService } from '../lib/routing/facets';
import {
  listServiceAreaTargets,
  listServiceIntentTargets,
} from '../lib/routing/inventory';
import { buildContextualLinks } from '../lib/links/engine';
import { evaluatePublishing } from '../lib/routing/publishing';

type Issue = {
  readonly sev: 'critical' | 'warn';
  readonly kind: string;
  readonly detail: string;
};

const issues: Issue[] = [];

function add(sev: Issue['sev'], kind: string, detail: string): void {
  issues.push({ sev, kind, detail });
}

const services = getServices();
const cities = getCities().filter((city) => city.published);
const areas = getAreas().filter((area) => area.published);
const intents = getSearchIntents().filter((intent) => intent.published);

for (const area of areas) {
  const city = getCityById(area.cityId);
  if (!city) {
    add('critical', 'orphan-area', `${area.id} → missing city ${area.cityId}`);
    continue;
  }
  if (!city.published) add('warn', 'area-unpublished-city', area.id);
  if (!getStateById(city.stateId)?.published) add('warn', 'area-unpublished-state', area.id);
}

for (const city of cities) {
  if (!city.districtId || !getDistrictById(city.districtId)) {
    add('critical', 'city-bad-district', `${city.slug} → ${city.districtId ?? 'none'}`);
  }
  const count = areas.filter((area) => area.cityId === city.id).length;
  if (count === 0) add('critical', 'city-zero-areas', city.slug);
  else if (count < 20) add('warn', 'city-thin-areas', `${city.slug}=${count}`);
  if (!city.neighbouringCityIds?.length) {
    add('warn', 'city-no-neighbours', city.slug);
  }
}

const svcArea = listServiceAreaTargets();
const expected = areas.length * services.length;
if (svcArea.length !== expected) {
  add(
    'critical',
    'service-area-mismatch',
    `${svcArea.length} inventory vs ${expected} expected`,
  );
}

const areaSlugKeys = new Set<string>();
for (const area of areas) {
  const key = `${area.cityId}:${area.slug}`;
  if (areaSlugKeys.has(key)) add('critical', 'dup-area-slug', key);
  areaSlugKeys.add(key);
}

let badAdj = 0;
for (const area of areas) {
  for (const id of area.adjacentAreaIds ?? []) {
    if (!getAreaById(id)) {
      badAdj += 1;
      if (badAdj <= 25) add('warn', 'bad-adjacency', `${area.id} → ${id}`);
    }
  }
}
if (badAdj > 25) add('warn', 'bad-adjacency-more', `+${badAdj - 25} more`);

for (const pair of taxonomyServiceIntentPairs()) {
  const service = getServiceBySlug(pair.serviceSlug);
  const intent = intents.find((entry) => entry.slug === pair.intentSlug);
  if (!service) {
    add('critical', 'taxonomy-missing-service', pair.serviceSlug);
    continue;
  }
  if (!intent) {
    add('critical', 'taxonomy-missing-intent', `${pair.serviceSlug}/${pair.intentSlug}`);
    continue;
  }
  if (!intentAppliesToService(intent, service)) {
    add('critical', 'taxonomy-intent-blocked', `${pair.serviceSlug}/${pair.intentSlug}`);
  }
}

for (const hub of listServiceIntentTargets()) {
  const content = buildPageContent(hub);
  const decision = evaluatePublishing(hub, content);
  if (!decision.indexable) {
    add('critical', 'hub-noindex', `${hub.path} — ${decision.reasons.join('; ')}`);
  }
}

for (const modifier of KEYWORD_MODIFIERS) {
  if (modifier.mintPage === false) continue;
  if (!intents.some((intent) => intent.slug === modifier.intentSlug)) {
    add('critical', 'modifier-intent-missing', modifier.intentSlug);
  }
}

let saFail = 0;
const sampleSize = Math.min(40, svcArea.length);
for (let i = 0; i < sampleSize; i += 1) {
  const target = svcArea[Math.floor((i * 9973) % svcArea.length)]!;
  const content = buildPageContent(target);
  const decision = evaluatePublishing(target, content);
  if (!decision.indexable) {
    saFail += 1;
    add('critical', 'service-area-noindex', `${target.path} — ${decision.reasons.join('; ')}`);
  }
}

// Link-budget starvation: every other service must remain linked from sample pages.
let linkStarve = 0;
for (let i = 0; i < Math.min(30, svcArea.length); i += 1) {
  const target = svcArea[Math.floor((i * 7919) % svcArea.length)]!;
  const groups = buildContextualLinks(target);
  const hrefs = [...groups.flatMap((group) => group.links.map((link) => link.href))];
  const others = services.filter((service) => service.id !== target.service?.id);
  const missing = others.filter(
    (service) => !hrefs.some((href) => href.includes(`/${service.slug}`)),
  );
  if (missing.length > 0) {
    linkStarve += 1;
    add(
      'critical',
      'link-budget-starved-services',
      `${target.path} missing ${missing.map((service) => service.slug).join(', ')}`,
    );
  }
}

// States with no cities / districts with no cities
for (const state of getStates().filter((entry) => entry.published)) {
  const stateCities = cities.filter((city) => city.stateId === state.id);
  if (stateCities.length === 0) add('critical', 'state-zero-cities', state.slug);
}

const critical = issues.filter((issue) => issue.sev === 'critical');
const warn = issues.filter((issue) => issue.sev === 'warn');

const report = {
  summary: {
    areas: areas.length,
    cities: cities.length,
    services: services.length,
    serviceAreaPages: svcArea.length,
    expectedServiceAreaPages: expected,
    serviceIntentHubs: listServiceIntentTargets().length,
    taxonomyPairs: taxonomyServiceIntentPairs().length,
    critical: critical.length,
    warn: warn.length,
    serviceAreaSampleFails: saFail,
    linkBudgetStarvedSamples: linkStarve,
    ok: critical.length === 0,
  },
  critical,
  warn: warn.slice(0, 60),
};

const out = resolve('scripts/tmp-coverage-audit.json');
writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

console.log('\nCoverage gap audit\n');
console.log(JSON.stringify(report.summary, null, 2));
if (critical.length) {
  console.log('\nCritical issues:');
  for (const issue of critical.slice(0, 40)) {
    console.log(`  ✗ ${issue.kind}: ${issue.detail}`);
  }
}
if (warn.length) {
  console.log(`\nWarnings: ${warn.length} (first 15)`);
  for (const issue of warn.slice(0, 15)) {
    console.log(`  • ${issue.kind}: ${issue.detail}`);
  }
}
console.log(`\nWrote ${out}\n`);
process.exit(critical.length ? 1 : 0);
