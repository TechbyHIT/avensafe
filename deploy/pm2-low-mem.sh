#!/usr/bin/env bash
# Small VPS: slow but stable build (22k SSG pages). Use screen so SSH drop doesn't stop it.
#
#   cd /var/www/avensafe
#   screen -S avensafe-build
#   bash deploy/pm2-low-mem.sh 2>&1 | tee logs/build-$(date +%F-%H%M).log
#   # detach: Ctrl+A then D
#   # reattach: screen -r avensafe-build
#
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export AVENSAFE_SG_CONCURRENCY="${AVENSAFE_SG_CONCURRENCY:-1}"
export AVENSAFE_SKIP_LINT=1
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}"
export NEXT_TELEMETRY_DISABLED=1
export SLIM="${SLIM:-1}"
echo "LOW-MEM build: SSG workers=$AVENSAFE_SG_CONCURRENCY NODE_OPTIONS=$NODE_OPTIONS"
echo "Expect 45–120 minutes for ~22k pages. Progress: Generating static pages (N/22834)"
exec bash "$ROOT/deploy/pm2-release.sh" --fast --slim --low-mem
