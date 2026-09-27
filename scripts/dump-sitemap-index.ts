/**
 * Renders `/sitemap.xml` index XML and per-file URL counts (without building
 * every long-tail batch).
 *
 *   npx tsx scripts/dump-sitemap-index.ts
 *   npx tsx scripts/dump-sitemap-index.ts --write
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { SITEMAP } from '../config/constants';
import {
  getLongTailSitemapIndexXml,
  getLongTailUrlsetXml,
  getPrimaryUrlsetXml,
  getSitemapFile,
  getSitemapIndexXml,
  listLongTailSitemapFileNames,
  listPrimarySitemapFileNames,
  listSitemapFileNames,
  resetSitemapCache,
} from '../lib/sitemap/engine';

const write = process.argv.includes('--write');

resetSitemapCache();
const started = Date.now();
const names = listSitemapFileNames();
const primary = listPrimarySitemapFileNames();
const longTail = listLongTailSitemapFileNames();
const xml = getSitemapIndexXml();
const primaryUrlset = getPrimaryUrlsetXml();
const longTailUrlset = getLongTailUrlsetXml();
const elapsed = ((Date.now() - started) / 1000).toFixed(1);
const countLocs = (body: string) => body.match(/<loc>/gu)?.length ?? 0;

console.log('--- submitted urlsets ---');
console.log(`  sitemap.xml urls: ${countLocs(primaryUrlset)}`);
console.log(`  sitemap-long-tail.xml urls: ${countLocs(longTailUrlset)}`);
console.log(xml);
console.log('\n--- long-tail index ---\n');
console.log(getLongTailSitemapIndexXml());
console.log('--- summary ---');
console.log(`  primary files: ${primary.length}`);
console.log(`  long-tail files: ${longTail.length}`);
console.log(`  all child files: ${names.length}  indexes built in ${elapsed}s`);
console.log(`  batchSize: ${SITEMAP.batchSize}`);
console.log('\nSample child files:');
for (const name of ['core', 'areas', 'services', 'guides', 'blog', 'service-area-intent-1']) {
  const resolved = names.includes(name)
    ? name
    : names.find((entry) => entry === name || entry.startsWith(`${name}-`));
  if (!resolved) continue;
  const file = getSitemapFile(resolved);
  console.log(`  ${resolved.padEnd(32)} ${String(file?.urls.length ?? 0).padStart(6)} urls`);
}
console.log('');

if (write) {
  const out = resolve('tmp-sitemap-index.xml');
  writeFileSync(out, xml, 'utf8');
  console.log(`Wrote ${out}\n`);
}
