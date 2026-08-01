/**
 * Prints the generated URL inventory with content statistics.
 *
 * Useful for tuning the publishing thresholds against real measured content
 * rather than guesses, and for seeing at a glance how many URLs the current JSON
 * corpus produces.
 */
import { buildPageContent } from '../lib/content/engine';
import { listAllTargets } from '../lib/routing/inventory';
import { evaluatePublishing } from '../lib/routing/publishing';
import type { PageKind } from '../config/routes';

interface Bucket {
  count: number;
  indexable: number;
  words: number[];
  ratios: number[];
  failures: { path: string; reasons: readonly string[] }[];
}

const buckets = new Map<PageKind, Bucket>();

for (const target of listAllTargets()) {
  const content = buildPageContent(target);
  const decision = evaluatePublishing(target, content);

  const bucket = buckets.get(target.kind) ?? {
    count: 0,
    indexable: 0,
    words: [],
    ratios: [],
    failures: [],
  };

  bucket.count += 1;
  if (decision.indexable) {
    bucket.indexable += 1;
  } else if (bucket.failures.length < 3) {
    bucket.failures.push({ path: target.path, reasons: decision.reasons });
  }
  bucket.words.push(content.wordCount);
  bucket.ratios.push(decision.specificityRatio);
  buckets.set(target.kind, bucket);
}

function stats(values: readonly number[]): { min: number; median: number; max: number } {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return {
    min: sorted[0] ?? 0,
    median: sorted[mid] ?? 0,
    max: sorted[sorted.length - 1] ?? 0,
  };
}

let totalUrls = 0;
let totalIndexable = 0;

console.log('\nGenerated URL inventory\n');
console.log(
  'kind                 urls  indexable   words (min/med/max)   specific % (min/med/max)',
);
console.log('-'.repeat(92));

for (const [kind, bucket] of buckets) {
  totalUrls += bucket.count;
  totalIndexable += bucket.indexable;
  const words = stats(bucket.words);
  const ratios = stats(bucket.ratios);
  console.log(
    `${kind.padEnd(20)} ${String(bucket.count).padStart(5)} ${String(bucket.indexable).padStart(10)}   ` +
      `${String(words.min).padStart(5)}/${String(words.median).padStart(4)}/${String(words.max).padStart(4)}        ` +
      `${(ratios.min * 100).toFixed(0).padStart(3)}/${(ratios.median * 100).toFixed(0).padStart(3)}/${(ratios.max * 100).toFixed(0).padStart(3)}`,
  );
}

console.log('-'.repeat(92));
console.log(`${'total'.padEnd(20)} ${String(totalUrls).padStart(5)} ${String(totalIndexable).padStart(10)}\n`);

const failing = [...buckets.entries()].filter(([, bucket]) => bucket.failures.length > 0);
if (failing.length > 0) {
  console.log('Sample pages failing the publishing gate:\n');
  for (const [kind, bucket] of failing) {
    for (const failure of bucket.failures) {
      console.log(`  ${kind} ${failure.path}`);
      for (const reason of failure.reasons) console.log(`      - ${reason}`);
    }
  }
  console.log('');
}
