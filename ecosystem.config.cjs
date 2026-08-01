/**
 * PM2 process file — standalone Node on port 3006 (no Docker).
 *
 * From app root after a successful `npm run build:standalone`:
 *   pm2 start ecosystem.config.cjs --only avensafe
 */
const fs = require('node:fs');
const path = require('node:path');

function resolveStandaloneDir() {
  const root = __dirname;
  const marker = path.join(root, '.next', 'standalone-app-dir.txt');
  if (fs.existsSync(marker)) {
    const dir = fs.readFileSync(marker, 'utf8').trim();
    if (dir && fs.existsSync(path.join(dir, 'server.js'))) return dir;
  }
  const candidates = [
    path.join(root, '.next', 'standalone'),
    path.join(root, '.next', 'standalone', 'avensafe'),
    path.join(root, '.next', 'standalone', 'avensafe-solutions'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'server.js'))) return dir;
  }
  // Fall back; prepare:standalone should have failed earlier if missing.
  return path.join(root, '.next', 'standalone');
}

const standaloneDir = resolveStandaloneDir();

module.exports = {
  apps: [
    {
      name: 'avensafe',
      cwd: standaloneDir,
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '1536M',
      watch: false,
      time: true,
      merge_logs: true,
      out_file: path.join(__dirname, 'logs', 'avensafe-out.log'),
      error_file: path.join(__dirname, 'logs', 'avensafe-error.log'),
      env: {
        NODE_ENV: 'production',
        PORT: 3006,
        HOSTNAME: '127.0.0.1',
        NEXT_TELEMETRY_DISABLED: '1',
      },
    },
  ],
};
