#!/usr/bin/env bash
# Faster redeploy + minimal disk (PM2 standalone, no Docker).
# Usage:
#   cd /var/www/avensafe && bash deploy/pm2-fast.sh
# Low RAM:
#   AVENSAFE_SG_CONCURRENCY=2 bash deploy/pm2-fast.sh
# Keep node_modules after deploy:
#   SLIM=0 bash deploy/pm2-fast.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SLIM="${SLIM:-1}"
ARGS=(--fast)
if [ "$SLIM" = "1" ]; then
  ARGS+=(--slim)
fi
exec bash "$ROOT/deploy/pm2-release.sh" "${ARGS[@]}"
