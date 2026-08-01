/**
 * PM2 process file — Option 2: standalone Node (no Docker).
 *
 * Usage on the VPS (from the app root after `npm run build:standalone`):
 *   pm2 start ecosystem.config.cjs --only avensafe
 *   pm2 save && pm2 startup
 *
 * Multi-site pattern: clone this block, change name / cwd / PORT / instances.
 * Avensafe listens on PORT 3006 — nginx proxies the domain to that port.
 */
module.exports = {
  apps: [
    {
      name: 'avensafe',
      cwd: './.next/standalone',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '750M',
      watch: false,
      time: true,
      env: {
        NODE_ENV: 'production',
        PORT: 3006,
        HOSTNAME: '127.0.0.1',
      },
      // Optional second site: PORT 3007, etc.
    },
  ],
};
