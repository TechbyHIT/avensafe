#!/usr/bin/env bash
# One-shot recovery when standalone manifests are missing.
# Run from /var/www/avensafe as root or deploy user:
#   bash deploy/fix-vps-now.sh

set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Install deps"
npm install

echo "==> Clean previous broken standalone"
rm -rf .next

echo "==> Build"
npm run build

echo "==> Assemble standalone (copies server + manifests + static + public)"
npm run prepare:standalone

APP_DIR="$(tr -d '\n' < .next/standalone-app-dir.txt)"
echo "APP_DIR=$APP_DIR"
ls -la "$APP_DIR/server.js"
ls -la "$APP_DIR/.next/server/middleware-manifest.json"
ls -la "$APP_DIR/.next/routes-manifest.json"
ls -la "$APP_DIR/.next/static" | head
ls -la "$APP_DIR/public" | head

mkdir -p logs
pm2 delete avensafe >/dev/null 2>&1 || true
pm2 start ecosystem.config.cjs --only avensafe
pm2 save

sleep 3
echo "==> Health"
curl -sS -o /tmp/avensafe.body -w "HTTP %{http_code}\n" http://127.0.0.1:3006/ || true
head -c 300 /tmp/avensafe.body; echo
pm2 status
echo "If HTTP 200, open https://avensafesolutions.com"
