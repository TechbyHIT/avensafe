import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(process.cwd());
const marker = join(root, '.next', 'standalone-app-dir.txt');

function resolveStandaloneDir() {
  if (existsSync(marker)) {
    const dir = readFileSync(marker, 'utf8').trim();
    if (dir && existsSync(join(dir, 'server.js'))) return dir;
  }
  const candidates = [
    join(root, '.next', 'standalone'),
    join(root, '.next', 'standalone', 'avensafe'),
    join(root, '.next', 'standalone', 'avensafe-solutions'),
  ];
  for (const dir of candidates) {
    if (existsSync(join(dir, 'server.js'))) return dir;
  }
  return null;
}

const standaloneDir = resolveStandaloneDir();
if (!standaloneDir) {
  console.error('Missing standalone server.js — run `npm run build:standalone` first.');
  process.exit(1);
}

const server = join(standaloneDir, 'server.js');
const env = {
  ...process.env,
  NODE_ENV: 'production',
  PORT: process.env.PORT || '3006',
  HOSTNAME: process.env.HOSTNAME || '127.0.0.1',
};

console.log(`Starting ${server} on ${env.HOSTNAME}:${env.PORT}`);
const child = spawn(process.execPath, [server], {
  cwd: standaloneDir,
  env,
  stdio: 'inherit',
});
child.on('exit', (code) => process.exit(code ?? 0));
