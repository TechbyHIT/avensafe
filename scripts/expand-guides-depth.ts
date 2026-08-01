/**
 * Appends depth sections to cornerstone guides (unique headings only).
 *
 *   npx tsx scripts/expand-guides-depth.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BUYING_DEPTH } from './expand-guides-depth-buying';
import { BUYING_DEPTH_B } from './expand-guides-depth-buying-b';
import {
  INSTALL_DEPTH,
  MAINTENANCE_DEPTH,
  PRICING_DEPTH,
} from './expand-guides-depth-install-pricing-maint';
import {
  FAQ_DEPTH_B,
  INSTALL_DEPTH_B,
  MAINTENANCE_DEPTH_B,
  PRICING_DEPTH_B,
} from './expand-guides-depth-batch-b';
import {
  BUYING_DEPTH_C,
  FAQ_DEPTH_C,
  INSTALL_DEPTH_C,
  MAINTENANCE_DEPTH_C,
  MATERIALS_DEPTH_C,
  PRICING_DEPTH_C,
  SAFETY_DEPTH_C,
} from './expand-guides-depth-batch-c';
import {
  BUYING_DEPTH_D,
  FAQ_DEPTH_D,
  INSTALL_DEPTH_D,
  MAINTENANCE_DEPTH_D,
  MATERIALS_DEPTH_D,
  PRICING_DEPTH_D,
  SAFETY_DEPTH_D,
} from './expand-guides-depth-batch-d';
import {
  BUYING_DEPTH_E,
  FAQ_DEPTH_E,
  INSTALL_DEPTH_E,
  MAINTENANCE_DEPTH_E,
  MATERIALS_DEPTH_E,
  PRICING_DEPTH_E,
  SAFETY_DEPTH_E,
} from './expand-guides-depth-batch-e';
import {
  BUYING_DEPTH_F,
  FAQ_DEPTH_F,
  INSTALL_DEPTH_F,
  MAINTENANCE_DEPTH_F,
  MATERIALS_DEPTH_F,
  PRICING_DEPTH_F,
  SAFETY_DEPTH_F,
} from './expand-guides-depth-batch-f';
import {
  BUYING_DEPTH_G,
  FAQ_DEPTH_G,
  INSTALL_DEPTH_G,
  MAINTENANCE_DEPTH_G,
  PRICING_DEPTH_G,
} from './expand-guides-depth-batch-g';
import {
  BUYING_DEPTH_H,
  FAQ_DEPTH_H,
  INSTALL_DEPTH_H,
  MAINTENANCE_DEPTH_H,
  MATERIALS_DEPTH_H,
  PRICING_DEPTH_H,
  SAFETY_DEPTH_H,
} from './expand-guides-depth-batch-h';
import {
  BUYING_DEPTH_I,
  FAQ_DEPTH_I,
  INSTALL_DEPTH_I,
  MAINTENANCE_DEPTH_I,
  PRICING_DEPTH_I,
} from './expand-guides-depth-batch-i';
import { DEPTH_J, MATERIALS_DEPTH_J, SAFETY_DEPTH_J } from './expand-guides-depth-batch-j';
import {
  BUYING_DEPTH_K,
  FAQ_DEPTH_K,
  MAINTENANCE_DEPTH_K,
  PRICING_DEPTH_K,
} from './expand-guides-depth-batch-k';
import {
  BUYING_DEPTH_L,
  FAQ_DEPTH_L,
  INSTALL_DEPTH_L,
  MAINTENANCE_DEPTH_L,
  PRICING_DEPTH_L,
} from './expand-guides-depth-batch-l';
import {
  BUYING_DEPTH_M,
  FAQ_DEPTH_M,
  INSTALL_DEPTH_M,
  MAINTENANCE_DEPTH_M,
  PRICING_DEPTH_M,
} from './expand-guides-depth-batch-m';
import {
  BUYING_DEPTH_N,
  FAQ_DEPTH_N,
  INSTALL_DEPTH_N,
  MAINTENANCE_DEPTH_N,
  PRICING_DEPTH_N,
} from './expand-guides-depth-batch-n';
import {
  BUYING_DEPTH_O,
  FAQ_DEPTH_O,
  MAINTENANCE_DEPTH_O,
  PRICING_DEPTH_O,
} from './expand-guides-depth-batch-o';
import {
  BUYING_DEPTH_P,
  FAQ_DEPTH_P,
  MAINTENANCE_DEPTH_P,
  PRICING_DEPTH_P,
} from './expand-guides-depth-batch-p';
import {
  BUYING_DEPTH_Q,
  FAQ_DEPTH_Q,
  MAINTENANCE_DEPTH_Q,
} from './expand-guides-depth-batch-q';
import { FAQ_DEPTH_R, MAINTENANCE_DEPTH_R } from './expand-guides-depth-batch-r';
import { FAQ_DEPTH_S, MAINTENANCE_DEPTH_S } from './expand-guides-depth-batch-s';
import { FAQ_DEPTH, MATERIALS_DEPTH, SAFETY_DEPTH } from './expand-guides-depth-faq-materials';
import type { Section } from './expand-guides-depth-types';

type Guide = {
  id: string;
  slug: string;
  title: string;
  heading: string;
  description: string;
  excerpt: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  readingMinutes: number;
  cornerstone: boolean;
  topic: string;
  sections: Section[];
  serviceIds: string[];
  faqIds: string[];
  published: boolean;
  imageId?: string;
};

const path = resolve('data/guides.json');
const guides = JSON.parse(readFileSync(path, 'utf8')) as Guide[];

function wordCount(guide: Guide): number {
  return guide.sections.reduce(
    (total, s) =>
      total +
      s.paragraphs.reduce((sum, para) => sum + para.split(/\s+/u).length, 0) +
      (s.bullets?.reduce((sum, b) => sum + b.split(/\s+/u).length, 0) ?? 0) +
      (s.callout ? s.callout.split(/\s+/u).length : 0),
    0,
  );
}

function appendUniqueSections(slug: string, extras: Section[]): void {
  const guide = guides.find((entry) => entry.slug === slug);
  if (!guide) throw new Error(`Missing guide ${slug}`);
  const existingHeadings = new Set(guide.sections.map((s) => s.heading));
  let added = 0;
  for (const extra of extras) {
    if (!existingHeadings.has(extra.heading)) {
      guide.sections.push(extra);
      existingHeadings.add(extra.heading);
      added += 1;
    }
  }
  guide.cornerstone = true;
  guide.updatedAt = '2026-08-01';
  guide.readingMinutes = Math.max(1, Math.round(wordCount(guide) / 180));
  console.log(`${slug}: appended ${added} sections (${extras.length - added} skipped as duplicates)`);
}

const SLUGS = [
  'balcony-safety-buying-guide',
  'installation-guide',
  'pricing-guide',
  'net-and-cable-maintenance-guide',
  'faq-troubleshooting-guide',
  'materials-guide',
  'safety-guide',
] as const;

appendUniqueSections('balcony-safety-buying-guide', [
  ...BUYING_DEPTH,
  ...BUYING_DEPTH_B,
  ...BUYING_DEPTH_C,
  ...BUYING_DEPTH_D,
  ...BUYING_DEPTH_E,
  ...BUYING_DEPTH_F,
  ...BUYING_DEPTH_G,
  ...BUYING_DEPTH_H,
  ...BUYING_DEPTH_I,
  ...(DEPTH_J['balcony-safety-buying-guide'] ?? []),
  ...BUYING_DEPTH_K,
  ...BUYING_DEPTH_L,
  ...BUYING_DEPTH_M,
  ...BUYING_DEPTH_N,
  ...BUYING_DEPTH_O,
  ...BUYING_DEPTH_P,
  ...BUYING_DEPTH_Q,
]);
appendUniqueSections('installation-guide', [
  ...INSTALL_DEPTH,
  ...INSTALL_DEPTH_B,
  ...INSTALL_DEPTH_C,
  ...INSTALL_DEPTH_D,
  ...INSTALL_DEPTH_E,
  ...INSTALL_DEPTH_F,
  ...INSTALL_DEPTH_G,
  ...INSTALL_DEPTH_H,
  ...INSTALL_DEPTH_I,
  ...(DEPTH_J['installation-guide'] ?? []),
  ...INSTALL_DEPTH_L,
  ...INSTALL_DEPTH_M,
  ...INSTALL_DEPTH_N,
]);
appendUniqueSections('pricing-guide', [
  ...PRICING_DEPTH,
  ...PRICING_DEPTH_B,
  ...PRICING_DEPTH_C,
  ...PRICING_DEPTH_D,
  ...PRICING_DEPTH_E,
  ...PRICING_DEPTH_F,
  ...PRICING_DEPTH_G,
  ...PRICING_DEPTH_H,
  ...PRICING_DEPTH_I,
  ...(DEPTH_J['pricing-guide'] ?? []),
  ...PRICING_DEPTH_K,
  ...PRICING_DEPTH_L,
  ...PRICING_DEPTH_M,
  ...PRICING_DEPTH_N,
  ...PRICING_DEPTH_O,
  ...PRICING_DEPTH_P,
]);
appendUniqueSections('net-and-cable-maintenance-guide', [
  ...MAINTENANCE_DEPTH,
  ...MAINTENANCE_DEPTH_B,
  ...MAINTENANCE_DEPTH_C,
  ...MAINTENANCE_DEPTH_D,
  ...MAINTENANCE_DEPTH_E,
  ...MAINTENANCE_DEPTH_F,
  ...MAINTENANCE_DEPTH_G,
  ...MAINTENANCE_DEPTH_H,
  ...MAINTENANCE_DEPTH_I,
  ...(DEPTH_J['net-and-cable-maintenance-guide'] ?? []),
  ...MAINTENANCE_DEPTH_K,
  ...MAINTENANCE_DEPTH_L,
  ...MAINTENANCE_DEPTH_M,
  ...MAINTENANCE_DEPTH_N,
  ...MAINTENANCE_DEPTH_O,
  ...MAINTENANCE_DEPTH_P,
  ...MAINTENANCE_DEPTH_Q,
  ...MAINTENANCE_DEPTH_R,
  ...MAINTENANCE_DEPTH_S,
]);
appendUniqueSections('faq-troubleshooting-guide', [
  ...FAQ_DEPTH,
  ...FAQ_DEPTH_B,
  ...FAQ_DEPTH_C,
  ...FAQ_DEPTH_D,
  ...FAQ_DEPTH_E,
  ...FAQ_DEPTH_F,
  ...FAQ_DEPTH_G,
  ...FAQ_DEPTH_H,
  ...FAQ_DEPTH_I,
  ...(DEPTH_J['faq-troubleshooting-guide'] ?? []),
  ...FAQ_DEPTH_K,
  ...FAQ_DEPTH_L,
  ...FAQ_DEPTH_M,
  ...FAQ_DEPTH_N,
  ...FAQ_DEPTH_O,
  ...FAQ_DEPTH_P,
  ...FAQ_DEPTH_Q,
  ...FAQ_DEPTH_R,
  ...FAQ_DEPTH_S,
]);

appendUniqueSections('materials-guide', [
  ...MATERIALS_DEPTH,
  ...MATERIALS_DEPTH_C,
  ...MATERIALS_DEPTH_D,
  ...MATERIALS_DEPTH_E,
  ...MATERIALS_DEPTH_F,
  ...MATERIALS_DEPTH_H,
  ...MATERIALS_DEPTH_J,
]);
appendUniqueSections('safety-guide', [
  ...SAFETY_DEPTH,
  ...SAFETY_DEPTH_C,
  ...SAFETY_DEPTH_D,
  ...SAFETY_DEPTH_E,
  ...SAFETY_DEPTH_F,
  ...SAFETY_DEPTH_H,
  ...SAFETY_DEPTH_J,
]);

writeFileSync(path, `${JSON.stringify(guides, null, 2)}\n`, 'utf8');

console.log('\nFinal word counts:');
for (const slug of SLUGS) {
  const guide = guides.find((g) => g.slug === slug);
  if (guide) {
    console.log(
      `${slug}: ~${wordCount(guide)} words, readingMinutes=${guide.readingMinutes}, sections=${guide.sections.length}`,
    );
  }
}
