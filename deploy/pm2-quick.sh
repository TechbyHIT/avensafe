#!/usr/bin/env bash
# ~2–5 minute rebuild for small VPS (hubs only; long-tail via ISR).
# Sitemap / indexable URLs unchanged (~3.1M still listed).
#
#   cd /var/www/avensafe && bash deploy/pm2-quick.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export AVENSAFE_QUICK_BUILD=1
export AVENSAFE_SKIP_LINT=1
export AVENSAFE_SG_CONCURRENCY="${AVENSAFE_SG_CONCURRENCY:-2}"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}"
export NEXT_TELEMETRY_DISABLED=1
export SLIM="${SLIM:-1}"
echo "QUICK BUILD: prerender hubs only (AVENSAFE_QUICK_BUILD=1) — target under 5 minutes"
ARGS=(--fast --slim)
exec bash "$ROOT/deploy/pm2-release.sh" "${ARGS[@]}"
