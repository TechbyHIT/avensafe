/**
 * Publishes missing canonical intents declared in config/keyword-modifiers.ts.
 *
 *   npx tsx scripts/sync-keyword-modifier-intents.ts
 *   npx tsx scripts/sync-keyword-modifier-intents.ts --dry-run
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { KEYWORD_MODIFIERS } from '../config/keyword-modifiers';

type Intent = {
  id: string;
  slug: string;
  label: string;
  titlePhrase: string;
  h1Phrase: string;
  lede: string;
  focusModules: string[];
  faqScopes: string[];
  published: boolean;
  dimension: string;
  tier: number;
  serviceSlugs?: string[];
  facetPoints?: { title: string; detail: string }[];
};

const dryRun = process.argv.includes('--dry-run');
const path = resolve('data/search-intents.json');
const intents = JSON.parse(readFileSync(path, 'utf8')) as Intent[];
const bySlug = new Map(intents.map((intent) => [intent.slug, intent]));

const NEW_INTENT_COPY: Record<
  string,
  Omit<Intent, 'id' | 'slug' | 'published'>
> = {
  amc: {
    label: 'AMC',
    titlePhrase: 'AMC',
    h1Phrase: 'annual maintenance',
    lede:
      'AMC searches are about scheduled checks after install — tension, tears, rust at terminations, and access for cleaning. This page explains what a maintenance visit covers and when a repair is wiser than a routine wash.',
    focusModules: ['maintenance', 'quality', 'installation'],
    faqScopes: ['service', 'maintenance', 'pricing'],
    dimension: 'commercial',
    tier: 3,
  },
  cleaning: {
    label: 'Cleaning',
    titlePhrase: 'cleaning',
    h1Phrase: 'cleaning and upkeep',
    lede:
      'Cleaning requests usually mean dust, bird droppings, or monsoon film on mesh and cable. We cover safe wash methods that do not cut UV stabilisers or loosen perimeter rope, and when cleaning should turn into a repair visit.',
    focusModules: ['maintenance', 'materials', 'quality'],
    faqScopes: ['service', 'maintenance'],
    dimension: 'commercial',
    tier: 3,
  },
  inspection: {
    label: 'Inspection',
    titlePhrase: 'inspection',
    h1Phrase: 'site inspection',
    lede:
      'An inspection is a measured survey of openings, substrate, and access before any quote is locked. This page lists what we check on apartments and houses so the specification matches the building, not a generic package.',
    focusModules: ['installation', 'safety', 'quality'],
    faqScopes: ['service', 'location'],
    dimension: 'commercial',
    tier: 3,
  },
  'for-factories': {
    label: 'For factories',
    titlePhrase: 'for factories',
    h1Phrase: 'for factories and industrial sites',
    lede:
      'Factory and warehouse work changes mesh grade, fixing into steel or masonry, and access around operations. We detail how industrial installs differ from residential balcony jobs and what a survey must confirm before materials are cut.',
    focusModules: ['applications', 'materials', 'installation', 'safety'],
    faqScopes: ['service', 'location'],
    dimension: 'property-type',
    tier: 3,
    serviceSlugs: [
      'safety-nets',
      'bird-pigeon-nets',
      'sports-nets',
      'duct-area-safety-nets',
      'building-covering-safety-nets',
    ],
  },
  'for-society': {
    label: 'For societies',
    titlePhrase: 'for societies',
    h1Phrase: 'for gated societies',
    lede:
      'Society and gated-community work usually needs association approval, lift bookings, and uniform detailing across many similar balconies. This page covers how we survey and schedule multi-flat installs without treating every tower as a one-off.',
    focusModules: ['applications', 'installation', 'quality'],
    faqScopes: ['service', 'location'],
    dimension: 'property-type',
    tier: 2,
    serviceSlugs: [
      'invisible-grills',
      'safety-nets',
      'balcony-nets',
      'bird-pigeon-nets',
      'cloth-hangers',
      'duct-area-safety-nets',
    ],
  },
  'for-families': {
    label: 'For families',
    titlePhrase: 'for families',
    h1Phrase: 'for family homes',
    lede:
      'Family-focused installs prioritise gap control, climb resistance, and finishes that stay serviceable with daily use. We explain how child, pet, and senior-access needs change spacing and fixing choices on balconies and windows.',
    focusModules: ['safety', 'applications', 'benefits', 'quality'],
    faqScopes: ['service', 'location'],
    dimension: 'audience',
    tier: 3,
    serviceSlugs: ['invisible-grills', 'safety-nets', 'balcony-nets'],
  },
  'uv-protected': {
    label: 'UV protected',
    titlePhrase: 'UV protected',
    h1Phrase: 'UV-stable specification',
    lede:
      'UV protection matters for netting and twine that sits in full sun for years. This page covers stabilised HDPE and nylon choices, when heavier denier is worth it, and how coastal sun plus monsoon wetting change inspection intervals.',
    focusModules: ['materials', 'features', 'maintenance'],
    faqScopes: ['service', 'maintenance'],
    dimension: 'material',
    tier: 3,
    serviceSlugs: [
      'safety-nets',
      'balcony-nets',
      'bird-pigeon-nets',
      'sports-nets',
      'duct-area-safety-nets',
      'building-covering-safety-nets',
    ],
  },
  'heavy-duty': {
    label: 'Heavy duty',
    titlePhrase: 'heavy duty',
    h1Phrase: 'heavy-duty specification',
    lede:
      'Heavy-duty usually means higher denier mesh, thicker rope, or stronger cable for wind, monkeys, or industrial loads. We separate marketing language from the survey measurements that actually justify a heavier grade.',
    focusModules: ['materials', 'safety', 'features'],
    faqScopes: ['service', 'pricing'],
    dimension: 'material',
    tier: 3,
  },
  'custom-size': {
    label: 'Custom size',
    titlePhrase: 'custom size',
    h1Phrase: 'made to measure',
    lede:
      'Custom size is the default for openings that are out of square or split by columns. This page explains how we measure, template, and cut so gaps stay consistent instead of forcing a stock panel onto a real balcony.',
    focusModules: ['installation', 'features', 'quality'],
    faqScopes: ['service', 'location'],
    dimension: 'design',
    tier: 3,
  },
  'bird-spikes': {
    label: 'Bird spikes',
    titlePhrase: 'bird spikes',
    h1Phrase: 'bird spike systems',
    lede:
      'Bird spikes stop landing on ledges and AC sills, but they do not replace netting where birds nest in depth. We cover when spikes, nets, or both are the honest specification, and how base material and pitch affect durability.',
    focusModules: ['applications', 'materials', 'installation', 'maintenance'],
    faqScopes: ['service', 'maintenance'],
    dimension: 'benefit',
    tier: 2,
    serviceSlugs: ['bird-pigeon-nets'],
    facetPoints: [
      {
        title: 'Ledge width first',
        detail:
          'Spike rows must cover the full landing depth; a single thin strip on a wide sill leaves a perch birds still use.',
      },
      {
        title: 'Nets vs spikes',
        detail:
          'Open shafts and deep ducts usually need mesh closure; spikes suit narrow external ledges and pipe runs.',
      },
    ],
  },
  'mosquito-nets': {
    label: 'Mosquito nets',
    titlePhrase: 'mosquito nets',
    h1Phrase: 'mosquito netting',
    lede:
      'Mosquito netting is a fine-mesh window and balcony product, not a fall-arrest system. We explain mesh aperture, frame options, and when residents should choose insect mesh, a safety net, or invisible grills for the same opening.',
    focusModules: ['applications', 'materials', 'installation', 'features'],
    faqScopes: ['service', 'location'],
    dimension: 'benefit',
    tier: 2,
    serviceSlugs: ['balcony-nets', 'safety-nets', 'invisible-grills'],
    facetPoints: [
      {
        title: 'Aperture vs safety gap',
        detail:
          'Insect mesh stops mosquitoes; it does not meet child fall-gap rules. Safety netting and grills are specified separately when fall risk exists.',
      },
      {
        title: 'Ventilation trade-off',
        detail:
          'Finer mesh reduces insect entry and also reduces airflow, so we match fabric to the room use and monsoon humidity.',
      },
    ],
  },
};

const added: string[] = [];
const updated: string[] = [];

for (const modifier of KEYWORD_MODIFIERS) {
  if (modifier.mintPage === false) continue;

  const existing = bySlug.get(modifier.intentSlug);
  if (!existing) {
    const copy = NEW_INTENT_COPY[modifier.intentSlug];
    if (!copy) {
      console.warn(`No copy template for new intent: ${modifier.intentSlug}`);
      continue;
    }
    const row: Intent = {
      id: `intent-${modifier.intentSlug}`,
      slug: modifier.intentSlug,
      published: true,
      ...copy,
      tier: modifier.tier ?? copy.tier,
      dimension: modifier.dimension ?? copy.dimension,
      serviceSlugs: modifier.serviceSlugs
        ? [...modifier.serviceSlugs]
        : copy.serviceSlugs,
    };
    intents.push(row);
    bySlug.set(row.slug, row);
    added.push(row.slug);
    continue;
  }

  // Align tier/serviceSlugs from catalog when safer (never loosen fabricated trust copy).
  let changed = false;
  if (modifier.tier && existing.tier !== modifier.tier && modifier.tier > existing.tier) {
    existing.tier = modifier.tier;
    changed = true;
  }
  if (modifier.serviceSlugs?.length) {
    const merged = [...new Set([...(existing.serviceSlugs ?? []), ...modifier.serviceSlugs])];
    if (
      !existing.serviceSlugs ||
      merged.length !== existing.serviceSlugs.length ||
      merged.some((slug, index) => slug !== existing.serviceSlugs![index])
    ) {
      existing.serviceSlugs = merged;
      changed = true;
    }
  }
  if (changed) updated.push(existing.slug);
}

console.log(`\nSync keyword modifier intents${dryRun ? ' (dry run)' : ''}\n`);
console.log(`  Added   : ${added.length}`);
for (const slug of added) console.log(`    + ${slug}`);
console.log(`  Updated : ${updated.length}`);
for (const slug of updated) console.log(`    ~ ${slug}`);

if (dryRun) {
  console.log('\nDry run — search-intents.json not modified.\n');
  process.exit(0);
}

writeFileSync(path, `${JSON.stringify(intents, null, 2)}\n`, 'utf8');
console.log(`\nWrote ${path} (${intents.length} intents)\n`);
