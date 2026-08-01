#!/usr/bin/env bash
# Faster full redeploy on VPS (still runs next build — required for code changes).
# Usage: cd /var/www/avensafe && bash deploy/pm2-fast.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec bash "$ROOT/deploy/pm2-release.sh" --fast
