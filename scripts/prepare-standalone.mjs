/**
 * After `next build` with `output: 'standalone'`, assemble a runnable folder:
 * - find server.js (top-level or nested under package path)
 * - copy public + .next/static (fast path on Linux via `cp -a`)
 * - patch only missing *manifest* files — never the full HTML page tree
 *
 * Optional: CLEAN_NODE_MODULES=1 removes root node_modules after assemble.
 */
import { spawnSync } from 'node:child_process';
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
const started = Date.now();

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

/** Prefer native `cp -a` on Linux — far faster than Node cpSync on large trees. */
function copyTree(src, dest) {
  mkdirSync(resolve(dest, '..'), { recursive: true });
  if (process.platform !== 'win32') {
    rmSync(dest, { recursive: true, force: true });
    const result = spawnSync('cp', ['-a', src, dest], { stdio: 'inherit' });
    if (result.status === 0) return;
    console.warn('cp -a failed; falling back to Node copy');
  }
  cpSync(src, dest, { recursive: true });
}

function copyFile(src, dest) {
  mkdirSync(resolve(dest, '..'), { recursive: true });
  cpSync(src, dest);
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

// Do NOT copy the entire .next/server tree (tens of thousands of HTML pages).
// Standalone already has the traced runtime; we only patch missing manifests.
const buildServer = join(buildNext, 'server');
const standaloneServer = join(standalone, '.next', 'server');
mkdirSync(standaloneServer, { recursive: true });

const serverManifests = [
  'middleware-manifest.json',
  'pages-manifest.json',
  'app-paths-manifest.json',
  'server-reference-manifest.json',
  'next-font-manifest.json',
];
let patched = 0;
for (const file of serverManifests) {
  const src = join(buildServer, file);
  const dest = join(standaloneServer, file);
  if (existsSync(src) && !existsSync(dest)) {
    copyFile(src, dest);
    patched += 1;
  }
}
console.log(`Patched ${patched} missing server manifest(s) (skipped full .next/server copy)`);

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
    copyFile(src, join(standalone, '.next', file));
  }
}
console.log('Synced .next manifests → standalone/.next');

if (!existsSync(staticDir)) {
  console.error('Missing .next/static — build incomplete.');
  process.exit(1);
}
copyTree(staticDir, join(standalone, '.next', 'static'));
console.log('Copied .next/static → standalone/.next/static');

if (existsSync(publicDir)) {
  copyTree(publicDir, join(standalone, 'public'));
  console.log('Copied public → standalone/public');
}

/**
 * Safe disk reclaim inside standalone:
 * delete prerender HTML/RSC/.meta only — NEVER page.js / layout.js / route.js.
 * Full SSG of millions of URLs embeds those artifacts and fills the VPS.
 */
function stripPrerenderArtifacts(dir) {
  if (!existsSync(dir)) return 0;
  let removed = 0;
  const walk = (current) => {
    for (const name of readdirSync(current)) {
      const full = join(current, name);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) {
        walk(full);
        continue;
      }
      if (name.endsWith('.html') || name.endsWith('.rsc') || name.endsWith('.meta')) {
        try {
          rmSync(full, { force: true });
          removed += 1;
        } catch {
          // ignore
        }
      }
    }
  };
  walk(dir);
  return removed;
}

const stripped = stripPrerenderArtifacts(join(standalone, '.next', 'server'));
console.log(
  `Stripped ${stripped} prerender artifact(s) (.html/.rsc/.meta) — route modules kept`,
);

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

const seconds = ((Date.now() - started) / 1000).toFixed(1);
console.log(`Standalone ready in ${seconds}s.`);
console.log(`  node ${join(standalone, 'server.js')}`);
console.log('  or: npm run start:standalone / pm2 start ecosystem.config.cjs');
