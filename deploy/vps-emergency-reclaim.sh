#!/usr/bin/env bash
# Emergency disk reclaim for 10–50+ PM2 Next standalone sites.
#
# SAFE — does NOT break the site:
#   - deletes *.html *.rsc *.meta (prerender cache only)
#   - deletes outer node_modules / .next/cache|server|static
#   - NEVER deletes page.js / layout.js / route.js / server.js
#
# Usage (as root):
#   export TMPDIR=/dev/shm
#   bash /var/www/avensafe/deploy/vps-emergency-reclaim.sh
#
# Optional:
#   WWW_ROOT=/var/www ONLY=avensafe bash .../vps-emergency-reclaim.sh
#   NUKE_ROOT_COPIES=1 bash ...   # also deletes /root/* project clones

set -euo pipefail
export TMPDIR="${TMPDIR:-/dev/shm}"

WWW_ROOT="${WWW_ROOT:-/var/www}"
ONLY="${ONLY:-}"
NUKE_ROOT_COPIES="${NUKE_ROOT_COPIES:-0}"

echo "==> BEFORE"
df -h / | tail -1
echo

strip_html_pages() {
  local server_dir="$1"
  [ -d "$server_dir" ] || return 0
  # ONLY prerender artifacts — never page.js / layout.js / route modules.
  find "$server_dir" -type f \( -name '*.html' -o -name '*.rsc' -o -name '*.meta' \) -delete 2>/dev/null || true
}

reclaim_site() {
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
    echo "  skip (.keep-build): $name"
    return 0
  fi

  local before after
  before="$(du -sh "$site" 2>/dev/null | awk '{print $1}')"
  echo "==> reclaim $name (was $before)"

  # Always drop install/build leftovers outside standalone
  rm -rf "$site/node_modules" \
         "$site/.next/cache" \
         "$site/.next/server" \
         "$site/.next/static" \
         "$site/.next/trace" \
         "$site/.next/types" \
         "$site/.next/diagnostics" 2>/dev/null || true

  # Top-level .next junk files (keep standalone marker)
  if [ -d "$site/.next" ]; then
    find "$site/.next" -maxdepth 1 -type f ! -name 'standalone-app-dir.txt' -delete 2>/dev/null || true
  fi

  # Resolve standalone app dir
  local app=""
  if [ -f "$site/.next/standalone-app-dir.txt" ]; then
    app="$(tr -d '\n' < "$site/.next/standalone-app-dir.txt")"
  fi
  if [ -z "$app" ] || [ ! -f "$app/server.js" ]; then
    app="$site/.next/standalone"
  fi
  # Nested package path
  if [ ! -f "$app/server.js" ] && [ -d "$site/.next/standalone" ]; then
    app="$(find "$site/.next/standalone" -maxdepth 3 -type f -name server.js 2>/dev/null | head -1 | xargs -r dirname)"
  fi

  if [ -n "$app" ] && [ -f "$app/server.js" ]; then
    echo "  standalone: $app"
    # Drop nested node_modules caches / build copies if any leaked
    rm -rf "$app/node_modules/.cache" 2>/dev/null || true
    # CRITICAL: strip prerender HTML inside standalone (can be 50–100G+)
    strip_html_pages "$app/.next/server"
    # Also strip if HTML landed under nested package
    strip_html_pages "$site/.next/standalone/.next/server"
    # Clear fetch/image caches inside standalone
    rm -rf "$app/.next/cache" 2>/dev/null || true
  else
    echo "  WARN: no standalone server.js — removed build dirs only"
  fi

  # Logs
  find "$site/logs" -type f -name '*.log' -exec truncate -s 0 {} \; 2>/dev/null || true

  after="$(du -sh "$site" 2>/dev/null | awk '{print $1}')"
  echo "  now: $after"
}

echo "==> Reclaiming sites under $WWW_ROOT"
for site in "$WWW_ROOT"/*; do
  reclaim_site "$site"
done

echo
echo "==> Global junk"
npm cache clean --force >/dev/null 2>&1 || true
rm -rf /root/.npm/_cacache /home/*/.npm/_cacache 2>/dev/null || true
rm -rf /tmp/npm-* /tmp/next-* /var/tmp/npm-* /var/tmp/next-* 2>/dev/null || true
apt-get clean -y >/dev/null 2>&1 || true
journalctl --vacuum-size=80M >/dev/null 2>&1 || true
pm2 flush >/dev/null 2>&1 || true

if [ "$NUKE_ROOT_COPIES" = "1" ]; then
  echo "==> Removing /root project clones (NOT live /var/www sites)"
  # Only known leftover folders from your du output — edit if needed
  rm -rf /root/deva-safety-nets "/root/deva safety nets" 2>/dev/null || true
fi

echo
echo "==> AFTER"
df -h / | tail -1
echo
echo "==> Site sizes"
du -xh "$WWW_ROOT" --max-depth=1 2>/dev/null | sort -hr | head -20
echo
echo "Policy for 50 sites: after EVERY deploy run this or slim-disk.sh."
echo "Never full-SSG millions of pages — use AVENSAFE_QUICK_BUILD=1 / pm2-quick.sh."
echo "Target ~0.5–2G per live site. Rebuild one site at a time."
