#!/usr/bin/env bash
# Build + prepare + (re)start Avensafe under PM2 on Linux (no Docker).
#
# Full release:
#   bash deploy/pm2-release.sh
#
# Faster (reuse deps if present, skip lint):
#   bash deploy/pm2-release.sh --fast
#
# Minimal disk after healthy start (recommended on VPS):
#   bash deploy/pm2-release.sh --fast --slim
#   # or: SLIM=1 bash deploy/pm2-fast.sh
#
# Restart only:
#   SKIP_BUILD=1 bash deploy/pm2-release.sh
#
# Optional:
#   FORCE_INSTALL=1
#   CLEAN_NODE_MODULES=1   (also set automatically by --slim)
#   AVENSAFE_SG_CONCURRENCY=2
#   bash deploy/pm2-low-mem.sh     # concurrency=1, 2GB heap (small VPS)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

for arg in "$@"; do
  case "$arg" in
    --fast|fast) FAST=1 ;;
    --skip-build) SKIP_BUILD=1 ;;
    --slim|slim) SLIM=1 ;;
    --low-mem|low-mem) LOW_MEM=1 ;;
  esac
done

FAST="${FAST:-0}"
SKIP_BUILD="${SKIP_BUILD:-0}"
FORCE_INSTALL="${FORCE_INSTALL:-0}"
SLIM="${SLIM:-0}"
LOW_MEM="${LOW_MEM:-0}"
CLEAN_NODE_MODULES="${CLEAN_NODE_MODULES:-0}"

if [ "$LOW_MEM" = "1" ]; then
  FAST=1
  export AVENSAFE_SKIP_LINT=1
  export AVENSAFE_SG_CONCURRENCY="${AVENSAFE_SG_CONCURRENCY:-1}"
  export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}"
  export NEXT_TELEMETRY_DISABLED=1
  echo "==> LOW-MEM mode (SSG concurrency=${AVENSAFE_SG_CONCURRENCY}, ${NODE_OPTIONS})"
fi

if [ "$SLIM" = "1" ]; then
  # Drop root node_modules during prepare; full slim after health check.
  CLEAN_NODE_MODULES=1
fi

if [ "$FAST" = "1" ] && [ "$LOW_MEM" != "1" ]; then
  export AVENSAFE_SKIP_LINT="${AVENSAFE_SKIP_LINT:-1}"
  export AVENSAFE_SG_CONCURRENCY="${AVENSAFE_SG_CONCURRENCY:-4}"
  echo "==> FAST mode (skip lint, SSG concurrency=${AVENSAFE_SG_CONCURRENCY})"
fi

if [ "$SLIM" = "1" ]; then
  echo "==> SLIM mode (remove build leftovers + node_modules after healthy start)"
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

  echo "==> Freeing Next cache only"
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

if [ "$SLIM" = "1" ]; then
  echo "==> Slimming disk (post-health)"
  bash "$ROOT/deploy/slim-disk.sh"
fi

echo "==> Done. nginx → 127.0.0.1:3006 (standalone only; no Docker)"
