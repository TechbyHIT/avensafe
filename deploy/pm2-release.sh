#!/usr/bin/env bash
# Build + prepare + (re)start Avensafe under PM2 on Linux.
# Usage from app root:
#   chmod +x deploy/pm2-release.sh
#   ./deploy/pm2-release.sh
# Optional slim disk after build:
#   CLEAN_NODE_MODULES=1 ./deploy/pm2-release.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Installing production+build deps"
if ! npm ci; then
  echo "npm ci failed (lock drift) — falling back to npm install"
  npm install
fi

echo "==> Freeing disk before build (safe caches only)"
rm -rf .next/cache || true
npm cache clean --force >/dev/null 2>&1 || true

echo "==> Building standalone"
npm run build

echo "==> Preparing standalone assets"
CLEAN_NODE_MODULES="${CLEAN_NODE_MODULES:-0}" npm run prepare:standalone

echo "==> Verifying standalone bundle"
test -f .next/standalone/server.js -o -f "$(tr -d '\n' < .next/standalone-app-dir.txt 2>/dev/null)/server.js"
APP_DIR="$(tr -d '\n' < .next/standalone-app-dir.txt)"
echo "standalone app dir: $APP_DIR"
test -f "$APP_DIR/server.js"
test -f "$APP_DIR/.next/server/middleware-manifest.json"
test -f "$APP_DIR/.next/routes-manifest.json"
test -d "$APP_DIR/.next/static"
test -d "$APP_DIR/public"

mkdir -p logs

echo "==> Restarting PM2 app 'avensafe'"
pm2 delete avensafe >/dev/null 2>&1 || true
pm2 start ecosystem.config.cjs --only avensafe

pm2 save
pm2 status

echo "==> Local health check"
sleep 3
CODE="$(curl -sS -o /tmp/avensafe-health.body -w "%{http_code}" http://127.0.0.1:3006/ || true)"
echo "HTTP $CODE"
if [ "$CODE" != "200" ] && [ "$CODE" != "304" ]; then
  echo "FAILED on :3006 — recent logs:"
  pm2 logs avensafe --lines 100 --nostream || true
  head -c 500 /tmp/avensafe-health.body 2>/dev/null || true
  exit 1
fi

echo "==> Done. nginx should proxy to 127.0.0.1:3006"
