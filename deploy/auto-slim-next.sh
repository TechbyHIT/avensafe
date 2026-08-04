#!/usr/bin/env bash
# Fast SAFE disk clean for Next standalone sites — NO rebuild required.
#
# Deletes only:
#   • outer leftovers: node_modules, .next/cache, .next/server, .next/static
#     (siblings of standalone — not used by PM2 at runtime)
#   • inside standalone: *.html *.rsc *.meta  (prerender cache only)
#
# NEVER deletes:
#   • page.js / layout.js / route.js / server.js
#   • .next/static/chunks inside standalone
#   • public / data / source
#
# Usage:
#   bash /var/www/avensafe/deploy/auto-slim-next.sh
#   ONLY=avensafe bash /var/www/avensafe/deploy/auto-slim-next.sh
#   WWW_ROOT=/var/www bash /var/www/avensafe/deploy/auto-slim-next.sh
#
# Cron (daily 4:15 AM):
#   15 4 * * * TMPDIR=/dev/shm /bin/bash /var/www/avensafe/deploy/auto-slim-next.sh >> /var/log/auto-slim-next.log 2>&1

set -euo pipefail
export TMPDIR="${TMPDIR:-/dev/shm}"

WWW_ROOT="${WWW_ROOT:-/var/www}"
ONLY="${ONLY:-}"

echo "==> auto-slim-next $(date -u +%Y-%m-%dT%H:%M:%SZ)"
df -h / | tail -1

slim_prerender_only() {
  local server_dir="$1"
  [ -d "$server_dir" ] || return 0
  find "$server_dir" -type f \( -name '*.html' -o -name '*.rsc' -o -name '*.meta' \) -delete 2>/dev/null || true
}

slim_site() {
  local site="$1"
  local name
  name="$(basename "$site")"
  [ -d "$site" ] || return 0
  case "$name" in
    html|cgi-bin|certbot|.*) return 0 ;;
  esac
  if [ -n "$ONLY" ] && [ "$name" != "$ONLY" ]; then
    return 0
  fi
  if [ -f "$site/.keep-build" ]; then
    echo "  skip (building): $name"
    return 0
  fi

  local before after app
  before="$(du -sm "$site" 2>/dev/null | awk '{print $1}')"

  # Resolve PM2 standalone cwd
  app=""
  if [ -f "$site/.next/standalone-app-dir.txt" ]; then
    app="$(tr -d '\n' < "$site/.next/standalone-app-dir.txt")"
  fi
  if [ -z "$app" ] || [ ! -f "$app/server.js" ]; then
    app="$site/.next/standalone"
  fi
  if [ ! -f "$app/server.js" ] && [ -d "$site/.next/standalone" ]; then
    app="$(find "$site/.next/standalone" -maxdepth 3 -name server.js -type f 2>/dev/null | head -1 | xargs -r dirname)"
  fi

  # Outer leftovers (safe — PM2 does not use these)
  rm -rf "$site/node_modules" \
         "$site/.next/cache" \
         "$site/.next/server" \
         "$site/.next/static" \
         "$site/.next/trace" \
         "$site/.next/types" \
         "$site/.next/diagnostics" 2>/dev/null || true
  if [ -d "$site/.next" ]; then
    find "$site/.next" -maxdepth 1 -type f ! -name 'standalone-app-dir.txt' -delete 2>/dev/null || true
  fi

  if [ -n "$app" ] && [ -f "$app/server.js" ]; then
    # Prerender artifacts only — keeps all *.js route modules
    slim_prerender_only "$app/.next/server"
    rm -rf "$app/.next/cache" 2>/dev/null || true
  else
    echo "  warn: no standalone for $name (outer clean only)"
  fi

  find "$site/logs" -type f -name '*.log' -exec truncate -s 0 {} \; 2>/dev/null || true

  after="$(du -sm "$site" 2>/dev/null | awk '{print $1}')"
  echo "  $name: ${before}M → ${after}M"
}

for site in "$WWW_ROOT"/*; do
  slim_site "$site"
done

# Tiny global junk
npm cache clean --force >/dev/null 2>&1 || true
rm -rf /root/.npm/_cacache 2>/dev/null || true

echo "==> done"
df -h / | tail -1
