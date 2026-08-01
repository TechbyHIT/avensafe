#!/usr/bin/env bash
# Emergency start for Avensafe on VPS — no fancy helpers required.
# Copy-paste OR:
#   cd /var/www/avensafe && bash deploy/emergency-start.sh

set -euo pipefail

APP="/var/www/avensafe"
PORT=3006

cd "$APP"
echo "PWD=$(pwd)"

echo "==> 1) Install deps"
if ! npm install; then
  echo "npm install failed"
  exit 1
fi

echo "==> 2) Build (skip if .next/standalone/server.js already exists from last build)"
if [ ! -f .next/standalone/server.js ]; then
  echo "No standalone server.js — running full build (this takes time)..."
  npm run build
else
  echo "Found existing .next/standalone/server.js — reusing build"
fi

if [ ! -f .next/standalone/server.js ]; then
  echo "ERROR: still no .next/standalone/server.js after build"
  ls -la .next || true
  ls -la .next/standalone || true
  exit 1
fi

echo "==> 3) Copy runtime files into standalone"
mkdir -p .next/standalone/.next/cache

if [ -d .next/server ]; then
  rm -rf .next/standalone/.next/server
  cp -a .next/server .next/standalone/.next/server
  echo "copied .next/server"
fi

if [ -d .next/static ]; then
  rm -rf .next/standalone/.next/static
  cp -a .next/static .next/standalone/.next/static
  echo "copied .next/static"
fi

if [ -d public ]; then
  rm -rf .next/standalone/public
  cp -a public .next/standalone/public
  echo "copied public"
fi

for f in routes-manifest.json build-manifest.json prerender-manifest.json required-server-files.json app-path-routes-manifest.json package.json; do
  if [ -f ".next/$f" ]; then
    cp -f ".next/$f" ".next/standalone/.next/$f"
    echo "copied $f"
  fi
done

# empty middleware manifest is ok if file exists
if [ ! -f .next/standalone/.next/server/middleware-manifest.json ] && [ -f .next/server/middleware-manifest.json ]; then
  cp -f .next/server/middleware-manifest.json .next/standalone/.next/server/middleware-manifest.json
fi

echo "==> 4) Verify required files"
for f in \
  .next/standalone/server.js \
  .next/standalone/.next/server/middleware-manifest.json \
  .next/standalone/.next/routes-manifest.json \
  .next/standalone/.next/static \
  .next/standalone/public
do
  if [ ! -e "$f" ]; then
    echo "MISSING: $f"
    exit 1
  fi
  echo "OK $f"
done

echo "/var/www/avensafe/.next/standalone" > .next/standalone-app-dir.txt

echo "==> 5) Restart PM2"
mkdir -p logs
pm2 delete avensafe >/dev/null 2>&1 || true

cd .next/standalone
PORT="$PORT" HOSTNAME=127.0.0.1 NODE_ENV=production \
  pm2 start server.js --name avensafe --update-env
cd "$APP"

pm2 save
pm2 status

echo "==> 6) Test"
sleep 2
echo -n "local :$PORT -> "
curl -sS -o /tmp/avensafe-out.html -w "%{http_code}\n" "http://127.0.0.1:${PORT}/" || echo "curl failed"
echo -n "https site -> "
curl -sS -o /dev/null -w "%{http_code}\n" https://avensafesolutions.com/ || echo "curl failed"

echo "==> If not 200, show logs:"
pm2 logs avensafe --lines 40 --nostream || true
echo "Done."
