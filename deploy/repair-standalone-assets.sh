#!/usr/bin/env bash
# Fix missing CSS/JS chunks + images when PM2 standalone lost .next/static or public.
# Does NOT require a full rebuild if the last build output still has .next/static + public.
#
#   cd /var/www/avensafe && bash deploy/repair-standalone-assets.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

APP_DIR=""
if [ -f .next/standalone-app-dir.txt ]; then
  APP_DIR="$(tr -d '\n' < .next/standalone-app-dir.txt)"
fi
if [ -z "$APP_DIR" ] || [ ! -f "$APP_DIR/server.js" ]; then
  APP_DIR="$ROOT/.next/standalone"
fi

if [ ! -f "$APP_DIR/server.js" ]; then
  echo "ERROR: no standalone server.js — run a full release:"
  echo "  AVENSAFE_SG_CONCURRENCY=2 bash deploy/pm2-fast.sh"
  exit 1
fi

echo "standalone: $APP_DIR"

need_rebuild=0

if [ ! -d .next/static ] && [ ! -d "$APP_DIR/.next/static/chunks" ]; then
  echo "ERROR: no .next/static in build or standalone — full rebuild required."
  need_rebuild=1
fi

if [ "$need_rebuild" = "1" ]; then
  exit 2
fi

mkdir -p "$APP_DIR/.next" "$APP_DIR/public"

if [ -d .next/static ]; then
  echo "==> Copy .next/static → standalone"
  rm -rf "$APP_DIR/.next/static"
  cp -a .next/static "$APP_DIR/.next/static"
elif [ -d "$APP_DIR/.next/static" ]; then
  echo "==> standalone already has .next/static"
else
  echo "ERROR: missing static assets"
  exit 2
fi

if [ -d public ]; then
  echo "==> Copy public → standalone"
  rm -rf "$APP_DIR/public"
  cp -a public "$APP_DIR/public"
fi

# Common manifests Next needs beside static
for f in routes-manifest.json build-manifest.json prerender-manifest.json app-path-routes-manifest.json; do
  if [ -f ".next/$f" ]; then
    cp -f ".next/$f" "$APP_DIR/.next/$f"
  fi
done

echo "==> Verify"
test -d "$APP_DIR/.next/static/chunks"
test -d "$APP_DIR/public"
ls "$APP_DIR/.next/static/chunks" | head
ls "$APP_DIR/public/images" 2>/dev/null | head || ls "$APP_DIR/public" | head

echo "==> Restart PM2"
pm2 delete avensafe >/dev/null 2>&1 || true
pm2 start ecosystem.config.cjs --only avensafe
pm2 save

sleep 2
CODE="$(curl -sS -o /dev/null -w "%{http_code}" http://127.0.0.1:3006/ || true)"
echo "home HTTP $CODE"

CHUNK="$(curl -sS http://127.0.0.1:3006/ | grep -oE '/_next/static/chunks/[^"]+\.js' | head -1 || true)"
echo "sample chunk: $CHUNK"
if [ -n "$CHUNK" ]; then
  curl -sS -o /dev/null -w "chunk HTTP %{http_code} type=%{content_type}\n" "http://127.0.0.1:3006${CHUNK}"
fi

IMG="$(find "$APP_DIR/public" -type f \( -name '*.jpg' -o -name '*.png' -o -name '*.webp' \) | head -1 || true)"
if [ -n "$IMG" ]; then
  REL="${IMG#"$APP_DIR/public"}"
  curl -sS -o /dev/null -w "public image HTTP %{http_code}\n" "http://127.0.0.1:3006${REL}"
fi

echo "Done. Hard-refresh the site (Ctrl+Shift+R)."
