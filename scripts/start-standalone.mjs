import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const standaloneDir = resolve(root, '.next/standalone');
const server = resolve(standaloneDir, 'server.js');

if (!existsSync(server)) {
  console.error('Missing .next/standalone/server.js — run `npm run build:standalone` first.');
  process.exit(1);
}

const env = {
  ...process.env,
  NODE_ENV: 'production',
  PORT: process.env.PORT || '3006',
  HOSTNAME: process.env.HOSTNAME || '127.0.0.1',
};

const child = spawn(process.execPath, [server], {
  cwd: standaloneDir,
  env,
  stdio: 'inherit',
});

child.on('exit', (code) => process.exit(code ?? 0));
