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
npm ci

echo "==> Building standalone"
npm run build

echo "==> Preparing standalone assets"
CLEAN_NODE_MODULES="${CLEAN_NODE_MODULES:-0}" npm run prepare:standalone

echo "==> Restarting PM2 app 'avensafe'"
if pm2 describe avensafe >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --only avensafe --update-env
else
  pm2 start ecosystem.config.cjs --only avensafe
fi

pm2 save
pm2 status
echo "==> Done. nginx should proxy to 127.0.0.1:3006"
