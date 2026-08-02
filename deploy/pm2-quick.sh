#!/usr/bin/env bash
# Fast VPS rebuild (~1–3 min): minimal prerender, long-tail via ISR.
# Sitemap / indexable URLs unchanged (~3.1M still listed).
#
#   cd /var/www/avensafe && bash deploy/pm2-quick.sh
# Skip sitemap gate: VALIDATE_SITEMAP=0 bash deploy/pm2-quick.sh
# Lower RAM: AVENSAFE_SG_CONCURRENCY=1 bash deploy/pm2-quick.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export AVENSAFE_QUICK_BUILD=1
export AVENSAFE_SKIP_LINT=1
# 4 workers is a good balance; override down if OOM.
export AVENSAFE_SG_CONCURRENCY="${AVENSAFE_SG_CONCURRENCY:-4}"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}"
export NEXT_TELEMETRY_DISABLED=1
export SLIM="${SLIM:-1}"
export VALIDATE_SITEMAP="${VALIDATE_SITEMAP:-1}"
echo "QUICK BUILD: AVENSAFE_QUICK_BUILD=1 SSG_CONCURRENCY=${AVENSAFE_SG_CONCURRENCY}"
echo "  Prerender: home/static + states + services + blog/guides only (cities/areas/intents = ISR)"
ARGS=(--fast --slim)
if [ "$VALIDATE_SITEMAP" = "1" ]; then
  ARGS+=(--validate-sitemap)
fi
exec bash "$ROOT/deploy/pm2-release.sh" "${ARGS[@]}"
