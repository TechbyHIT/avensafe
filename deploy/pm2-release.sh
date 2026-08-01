#!/usr/bin/env bash
# Build + prepare + (re)start Avensafe under PM2 on Linux.
#
# Full release (default):
#   bash deploy/pm2-release.sh
#
# Faster release (reuse node_modules, skip lint, more SSG workers):
#   bash deploy/pm2-release.sh --fast
#   # or: FAST=1 bash deploy/pm2-release.sh
#
# Restart only (no pull/build — use after prepare already done):
#   SKIP_BUILD=1 bash deploy/pm2-release.sh
#
# Optional:
#   FORCE_INSTALL=1   always npm ci/install
#   CLEAN_NODE_MODULES=1   remove root node_modules after prepare

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

for arg in "$@"; do
  case "$arg" in
    --fast|fast) FAST=1 ;;
    --skip-build) SKIP_BUILD=1 ;;
  esac
done

FAST="${FAST:-0}"
SKIP_BUILD="${SKIP_BUILD:-0}"
FORCE_INSTALL="${FORCE_INSTALL:-0}"
CLEAN_NODE_MODULES="${CLEAN_NODE_MODULES:-0}"

if [ "$FAST" = "1" ]; then
  export AVENSAFE_SKIP_LINT="${AVENSAFE_SKIP_LINT:-1}"
  export AVENSAFE_SG_CONCURRENCY="${AVENSAFE_SG_CONCURRENCY:-8}"
  echo "==> FAST mode (skip lint, SSG concurrency=${AVENSAFE_SG_CONCURRENCY})"
fi

if [ "$SKIP_BUILD" != "1" ]; then
  if [ "$FORCE_INSTALL" = "1" ] || [ ! -d node_modules ]; then
    echo "==> Installing deps"
    if ! npm ci; then
      echo "npm ci failed (lock drift) — falling back to npm install"
      npm install
    fi
  else
    echo "==> Reusing node_modules (FORCE_INSTALL=1 to reinstall)"
  fi

  echo "==> Freeing Next cache only (keeping npm cache)"
  rm -rf .next/cache || true

  echo "==> Building standalone"
  npm run build

  echo "==> Preparing standalone assets"
  CLEAN_NODE_MODULES="$CLEAN_NODE_MODULES" npm run prepare:standalone
else
  echo "==> SKIP_BUILD=1 — prepare + PM2 only"
  if [ ! -f .next/standalone/server.js ] && [ ! -f .next/standalone-app-dir.txt ]; then
    echo "ERROR: no standalone build present. Run without SKIP_BUILD first."
    exit 1
  fi
  CLEAN_NODE_MODULES=0 npm run prepare:standalone
fi

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
