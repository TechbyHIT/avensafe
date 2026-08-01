/**
 * Keeps the ISR windows in route files in step with `config/constants.ts`.
 *
 * Next statically parses segment config, so `export const revalidate` must be a
 * literal number — it cannot reference `REVALIDATE.city`. Each route therefore
 * writes the literal and annotates it with the config key it mirrors:
 *
 *     export const revalidate = 86400; // REVALIDATE.city
 *
 * This script asserts those literals still match the config, so the values keep
 * a single source of truth despite the framework constraint.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { REVALIDATE } from '../config/constants';

const errors: string[] = [];
let checked = 0;

function walk(dir: string): readonly string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.tsx?$/u.test(entry) ? [full] : [];
  });
}

const annotated = /export const revalidate = (\d+); \/\/ REVALIDATE\.(\w+)/gu;
const bare = /export const revalidate = (\d+);(?! \/\/ REVALIDATE\.)/u;

for (const file of walk('app')) {
  const source = readFileSync(file, 'utf8');
  if (!source.includes('export const revalidate')) continue;

  let matched = false;
  for (const match of source.matchAll(annotated)) {
    matched = true;
    checked += 1;
    const literal = Number(match[1]);
    const key = match[2] as keyof typeof REVALIDATE;
    const expected = REVALIDATE[key];

    if (expected === undefined) {
      errors.push(`${file}: annotated with unknown config key REVALIDATE.${key}`);
    } else if (literal !== expected) {
      errors.push(
        `${file}: revalidate is ${literal} but REVALIDATE.${key} is ${expected} — update the literal or the config`,
      );
    }
  }

  if (!matched && bare.test(source)) {
    errors.push(
      `${file}: has a revalidate literal with no "// REVALIDATE.<key>" annotation, so it cannot be checked against the config`,
    );
  }
}

if (errors.length > 0) {
  console.error(`\nISR validation failed with ${errors.length} problem(s):\n`);
  for (const error of errors) console.error(`  • ${error}`);
  console.error('');
  process.exit(1);
}

console.log(`\nISR validation passed (${checked} route revalidate value(s) match the config).\n`);
