/**
 * After `next build` with `output: 'standalone'`, copy static assets into the
 * standalone folder so `node .next/standalone/server.js` can serve them.
 *
 * Also optional: strip root node_modules to reclaim disk (set CLEAN_NODE_MODULES=1).
 */
import { cpSync, existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(process.cwd());
const standalone = join(root, '.next', 'standalone');
const staticDir = join(root, '.next', 'static');
const publicDir = join(root, 'public');

if (!existsSync(join(standalone, 'server.js'))) {
  console.error('Missing .next/standalone/server.js — run `npm run build` first.');
  process.exit(1);
}

cpSync(staticDir, join(standalone, '.next', 'static'), { recursive: true });
console.log('Copied .next/static → .next/standalone/.next/static');

if (existsSync(publicDir)) {
  cpSync(publicDir, join(standalone, 'public'), { recursive: true });
  console.log('Copied public → .next/standalone/public');
}

if (process.env.CLEAN_NODE_MODULES === '1') {
  const nm = join(root, 'node_modules');
  if (existsSync(nm)) {
    rmSync(nm, { recursive: true, force: true });
    console.log('Removed root node_modules (CLEAN_NODE_MODULES=1)');
  }
}

console.log('Standalone ready. Start with: npm run start:standalone  OR  pm2 start ecosystem.config.cjs');
