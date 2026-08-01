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
  getSitemapFile,
  listSitemapFileNames,
  renderSitemapIndex,
  resetSitemapCache,
} from '../lib/sitemap/engine';

const write = process.argv.includes('--write');

resetSitemapCache();
const started = Date.now();
const names = listSitemapFileNames();
const xml = renderSitemapIndex(names);
const elapsed = ((Date.now() - started) / 1000).toFixed(1);

console.log(xml);
console.log('--- summary ---');
console.log(`  files: ${names.length}  index built in ${elapsed}s`);
console.log(`  batchSize: ${SITEMAP.batchSize}`);
console.log('\nSample child files:');
for (const name of ['core', 'areas-1', 'services', 'guides', 'blog'].filter((n) =>
  names.includes(n) || names.some((x) => x.startsWith(n)),
)) {
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
