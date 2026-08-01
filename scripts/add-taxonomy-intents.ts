/**
 * Adds search intents required by config/service-taxonomy.ts.
 *
 *   npx tsx scripts/add-taxonomy-intents.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

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

const path = resolve('data/search-intents.json');
const intents = JSON.parse(readFileSync(path, 'utf8')) as Intent[];
const existing = new Set(intents.map((i) => i.slug));

function add(intent: Intent): void {
  if (existing.has(intent.slug)) return;
  intents.push(intent);
  existing.add(intent.slug);
}

const baseFaq = ['service', 'location'] as const;

add({
  id: 'intent-bird-control',
  slug: 'bird-control',
  label: 'Bird control',
  titlePhrase: 'bird control',
  h1Phrase: 'bird control',
  lede:
    'Bird control with nets is about aperture, overlaps, and closing corners — not only hanging a panel. This page covers how we survey ledges and balconies so birds cannot work a gap open after install.',
  focusModules: ['applications', 'materials', 'installation', 'maintenance'],
  faqScopes: [...baseFaq, 'maintenance'],
  published: true,
  dimension: 'problem',
  tier: 1,
  serviceSlugs: ['bird-pigeon-nets', 'safety-nets', 'balcony-nets', 'duct-area-safety-nets'],
});

add({
  id: 'intent-pigeon-control',
  slug: 'pigeon-control',
  label: 'Pigeon control',
  titlePhrase: 'pigeon control',
  h1Phrase: 'pigeon exclusion',
  lede:
    'Pigeons exploit AC ledges, railing tops, and duct mouths. We specify mesh and fixing density for pigeon exclusion and explain when spikes alone are not enough.',
  focusModules: ['applications', 'materials', 'safety', 'maintenance'],
  faqScopes: [...baseFaq],
  published: true,
  dimension: 'problem',
  tier: 1,
  serviceSlugs: ['bird-pigeon-nets', 'safety-nets', 'balcony-nets'],
});

add({
  id: 'intent-for-ducts',
  slug: 'for-ducts',
  label: 'For ducts',
  titlePhrase: 'for ducts',
  h1Phrase: 'for duct openings',
  lede:
    'Duct and shaft mouths need mesh that keeps birds out without pretending every panel is a fall-arrest system. This page covers survey points for duct-area bird and safety nets.',
  focusModules: ['applications', 'installation', 'safety', 'access'],
  faqScopes: [...baseFaq],
  published: true,
  dimension: 'opening',
  tier: 2,
  serviceSlugs: ['bird-pigeon-nets', 'duct-area-safety-nets', 'safety-nets'],
});

add({
  id: 'intent-cricket-nets',
  slug: 'cricket-nets',
  label: 'Cricket nets',
  titlePhrase: 'cricket practice nets',
  h1Phrase: 'cricket practice nets',
  lede:
    'Cricket practice nets need height, containment, and UV-stable mesh sized for ball impact rather than balcony bird exclusion. We survey span, run-up clearance, and fixing into posts or structures.',
  focusModules: ['applications', 'materials', 'installation', 'safety'],
  faqScopes: [...baseFaq, 'pricing'],
  published: true,
  dimension: 'application',
  tier: 1,
  serviceSlugs: ['sports-nets'],
});

add({
  id: 'intent-containment',
  slug: 'containment',
  label: 'Containment',
  titlePhrase: 'containment',
  h1Phrase: 'sports containment',
  lede:
    'Sports containment nets keep balls and equipment inside a court or practice bay. Specification follows ball type, wind exposure, and how spectators sit relative to the net line.',
  focusModules: ['applications', 'materials', 'installation'],
  faqScopes: [...baseFaq],
  published: true,
  dimension: 'application',
  tier: 2,
  serviceSlugs: ['sports-nets'],
});

add({
  id: 'intent-playground',
  slug: 'playground',
  label: 'Playground',
  titlePhrase: 'for playgrounds',
  h1Phrase: 'playground safety nets',
  lede:
    'Playground nets protect children around open edges and contain play equipment zones. We align mesh and height with how the playground is supervised and where fall risk sits.',
  focusModules: ['safety', 'applications', 'materials', 'installation'],
  faqScopes: [...baseFaq],
  published: true,
  dimension: 'audience',
  tier: 2,
  serviceSlugs: ['sports-nets', 'safety-nets'],
});

add({
  id: 'intent-for-schools',
  slug: 'for-schools',
  label: 'For schools',
  titlePhrase: 'for schools',
  h1Phrase: 'for schools',
  lede:
    'School installs need durable mesh, clear handover notes for facility staff, and scheduling around term time. This page covers how we survey sports and play areas on campuses.',
  focusModules: ['applications', 'safety', 'installation', 'quality'],
  faqScopes: [...baseFaq],
  published: true,
  dimension: 'audience',
  tier: 2,
  serviceSlugs: ['sports-nets', 'safety-nets', 'building-covering-safety-nets'],
});

add({
  id: 'intent-ceiling',
  slug: 'ceiling',
  label: 'Ceiling',
  titlePhrase: 'ceiling mounted',
  h1Phrase: 'ceiling cloth hangers',
  lede:
    'Ceiling cloth hangers need sound slab or beam fixings and a clear drop path for drying. We survey ceiling type, load, and pulley reach before quoting.',
  focusModules: ['applications', 'installation', 'materials', 'safety'],
  faqScopes: [...baseFaq],
  published: true,
  dimension: 'opening',
  tier: 2,
  serviceSlugs: ['cloth-hangers'],
});

add({
  id: 'intent-wall-mounted',
  slug: 'wall-mounted',
  label: 'Wall mounted',
  titlePhrase: 'wall mounted',
  h1Phrase: 'wall mounted cloth hangers',
  lede:
    'Wall-mounted hangers suit balconies and utility walls where ceiling fixings are impractical. Substrate condition and projection clearances decide the bracket type.',
  focusModules: ['applications', 'installation', 'materials'],
  faqScopes: [...baseFaq],
  published: true,
  dimension: 'opening',
  tier: 2,
  serviceSlugs: ['cloth-hangers'],
});

add({
  id: 'intent-pulley',
  slug: 'pulley',
  label: 'Pulley',
  titlePhrase: 'pulley system',
  h1Phrase: 'pulley cloth hangers',
  lede:
    'Pulley cloth hangers let you raise and lower drying lines safely. We specify cable, pulley, and lock hardware so the system stays operable after monsoon dust and coastal air.',
  focusModules: ['features', 'materials', 'installation', 'maintenance'],
  faqScopes: [...baseFaq, 'maintenance'],
  published: true,
  dimension: 'product',
  tier: 2,
  serviceSlugs: ['cloth-hangers'],
});

add({
  id: 'intent-shaft',
  slug: 'shaft',
  label: 'Shaft',
  titlePhrase: 'for shafts',
  h1Phrase: 'shaft safety nets',
  lede:
    'Shaft nets stop debris and birds entering vertical service voids. Panel size, fixing density, and access for later maintenance are set on survey — not from a floor-plan guess.',
  focusModules: ['applications', 'safety', 'installation', 'access'],
  faqScopes: [...baseFaq],
  published: true,
  dimension: 'opening',
  tier: 1,
  serviceSlugs: ['duct-area-safety-nets', 'safety-nets', 'bird-pigeon-nets'],
});

add({
  id: 'intent-construction',
  slug: 'construction',
  label: 'Construction',
  titlePhrase: 'construction',
  h1Phrase: 'construction safety nets',
  lede:
    'Construction covering nets manage debris and edge risk during works. Duty rating, tie-in points, and wind exposure differ from permanent residential balcony nets.',
  focusModules: ['applications', 'safety', 'materials', 'installation'],
  faqScopes: [...baseFaq, 'pricing'],
  published: true,
  dimension: 'application',
  tier: 1,
  serviceSlugs: ['building-covering-safety-nets'],
});

add({
  id: 'intent-facade-debris',
  slug: 'facade-debris',
  label: 'Facade debris',
  titlePhrase: 'facade debris',
  h1Phrase: 'facade debris nets',
  lede:
    'Facade debris nets protect people and property below during exterior works. We survey bay height, wind, and how panels will be inspected while the scaffold is live.',
  focusModules: ['applications', 'safety', 'installation', 'access'],
  faqScopes: [...baseFaq],
  published: true,
  dimension: 'application',
  tier: 2,
  serviceSlugs: ['building-covering-safety-nets'],
});

writeFileSync(path, `${JSON.stringify(intents, null, 2)}\n`, 'utf8');
console.log(`Intents now: ${intents.length}`);
