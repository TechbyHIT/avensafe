#!/usr/bin/env bash
# <1 minute: no rebuild. Fix CSS/images + restart PM2 only.
#   cd /var/www/avensafe && bash deploy/pm2-instant.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
mkdir -p logs
if bash "$ROOT/deploy/repair-standalone-assets.sh"; then
  exit 0
fi
echo "Repair failed — run quick rebuild: bash deploy/pm2-quick.sh"
exit 1
