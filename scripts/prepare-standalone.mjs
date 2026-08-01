/**
 * After `next build` with `output: 'standalone'`, assemble a runnable folder:
 * - find server.js (top-level or nested under package path)
 * - copy public + .next/static
 * - repair missing server manifests from the main .next build output
 *
 * Optional: CLEAN_NODE_MODULES=1 removes root node_modules after assemble.
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(process.cwd());
const standaloneRoot = join(root, '.next', 'standalone');
const buildNext = join(root, '.next');
const staticDir = join(buildNext, 'static');
const publicDir = join(root, 'public');

function findServerJs(dir, depth = 0) {
  if (!existsSync(dir) || depth > 4) return null;
  const direct = join(dir, 'server.js');
  if (existsSync(direct)) return direct;
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules') continue;
    const full = join(dir, name);
    try {
      if (statSync(full).isDirectory()) {
        const hit = findServerJs(full, depth + 1);
        if (hit) return hit;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

if (!existsSync(standaloneRoot)) {
  console.error('Missing .next/standalone — run `npm run build` with output: "standalone" first.');
  process.exit(1);
}

const serverJs = findServerJs(standaloneRoot);
if (!serverJs) {
  console.error('No server.js under .next/standalone — build incomplete. Re-run: npm run build');
  process.exit(1);
}

const standalone = resolve(serverJs, '..');
console.log(`Using standalone app dir: ${standalone}`);

mkdirSync(join(standalone, '.next', 'cache'), { recursive: true });
mkdirSync(join(root, 'logs'), { recursive: true });

// Copy full server output (manifests + chunks) from the build into standalone.
const buildServer = join(buildNext, 'server');
if (existsSync(buildServer)) {
  cpSync(buildServer, join(standalone, '.next', 'server'), { recursive: true });
  console.log('Synced .next/server → standalone/.next/server');
}

const manifestFiles = [
  'routes-manifest.json',
  'app-path-routes-manifest.json',
  'build-manifest.json',
  'prerender-manifest.json',
  'react-loadable-manifest.json',
  'required-server-files.json',
  'package.json',
];
for (const file of manifestFiles) {
  const src = join(buildNext, file);
  if (existsSync(src)) {
    cpSync(src, join(standalone, '.next', file));
  }
}
console.log('Synced .next manifests → standalone/.next');

if (!existsSync(staticDir)) {
  console.error('Missing .next/static — build incomplete.');
  process.exit(1);
}
cpSync(staticDir, join(standalone, '.next', 'static'), { recursive: true });
console.log('Copied .next/static → standalone/.next/static');

if (existsSync(publicDir)) {
  cpSync(publicDir, join(standalone, 'public'), { recursive: true });
  console.log('Copied public → standalone/public');
}

const required = [
  join(standalone, 'server.js'),
  join(standalone, '.next', 'server', 'middleware-manifest.json'),
  join(standalone, '.next', 'routes-manifest.json'),
  join(standalone, '.next', 'static'),
  join(standalone, 'public'),
];
const missing = required.filter((path) => !existsSync(path));
if (missing.length > 0) {
  console.error('Standalone still incomplete:');
  for (const path of missing) console.error(`  - ${path}`);
  process.exit(1);
}

// Write resolved path for PM2 / start script.
const marker = join(root, '.next', 'standalone-app-dir.txt');
writeFileSync(marker, `${standalone}\n`, 'utf8');
console.log(`Wrote ${marker}`);

if (process.env.CLEAN_NODE_MODULES === '1') {
  const nm = join(root, 'node_modules');
  if (existsSync(nm)) {
    rmSync(nm, { recursive: true, force: true });
    console.log('Removed root node_modules (CLEAN_NODE_MODULES=1)');
  }
}

console.log('Standalone ready.');
console.log(`  node ${join(standalone, 'server.js')}`);
console.log('  or: npm run start:standalone / pm2 start ecosystem.config.cjs');
