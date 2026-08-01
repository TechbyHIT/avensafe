#!/usr/bin/env bash
# Reclaim disk after a successful standalone + PM2 deploy.
# Safe: PM2 serves only .next/standalone — root node_modules and the
# leftover build tree (.next/server HTML, .next/static, cache) are unused.
#
#   cd /var/www/avensafe && bash deploy/slim-disk.sh
#
# Does NOT touch: .next/standalone, public/, data/, source, nginx, PM2.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

APP_DIR=""
if [ -f .next/standalone-app-dir.txt ]; then
  APP_DIR="$(tr -d '\n' < .next/standalone-app-dir.txt)"
fi
if [ -z "$APP_DIR" ] || [ ! -f "$APP_DIR/server.js" ]; then
  APP_DIR="$ROOT/.next/standalone"
fi
if [ ! -f "$APP_DIR/server.js" ]; then
  echo "ERROR: no standalone server.js — refuse to slim (run a release first)."
  exit 1
fi

echo "==> Disk before slim"
df -h "$ROOT" | tail -1 || true
du -sh "$ROOT" node_modules .next .next/standalone 2>/dev/null || true

echo "==> Removing root node_modules (runtime uses standalone)"
rm -rf node_modules

echo "==> Removing build leftovers (keeping .next/standalone)"
# Huge prerender HTML + caches live here; already copied/traced into standalone.
rm -rf .next/cache .next/server .next/static
# Top-level manifests not needed at runtime (standalone has its own copies).
find .next -maxdepth 1 -type f ! -name 'standalone-app-dir.txt' -delete 2>/dev/null || true

echo "==> Clearing npm cache"
npm cache clean --force >/dev/null 2>&1 || true

echo "==> Trimming PM2 logs older than keep"
: > logs/avensafe-out.log 2>/dev/null || true
: > logs/avensafe-error.log 2>/dev/null || true

echo "==> Disk after slim"
df -h "$ROOT" | tail -1 || true
du -sh "$ROOT" .next .next/standalone public data 2>/dev/null || true

echo "==> Verify runtime still present"
test -f "$APP_DIR/server.js"
test -d "$APP_DIR/.next/static"
test -d "$APP_DIR/public"
echo "OK — PM2 should keep running from: $APP_DIR"
echo "Next deploy will reinstall node_modules automatically (missing dir)."
