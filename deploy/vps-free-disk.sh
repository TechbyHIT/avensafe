#!/usr/bin/env bash
# Aggressive but safe disk reclaim for many PM2 + Next standalone sites under /var/www.
#
# Keeps per site: .next/standalone (+ marker), source, public, data
# Removes per site: node_modules, .next/cache, .next/server, .next/static (outside standalone)
#
# Usage (as root):
#   bash /var/www/avensafe/deploy/vps-free-disk.sh
#   WWW_ROOT=/var/www bash /var/www/avensafe/deploy/vps-free-disk.sh
#
# Skip a site mid-build: touch /var/www/some-site/.keep-build

set -euo pipefail

WWW_ROOT="${WWW_ROOT:-/var/www}"

echo "==> Disk BEFORE"
df -h / | tail -1
echo

slim_one_site() {
  local site="$1"
  local marker="$site/.next/standalone-app-dir.txt"
  local standalone=""

  if [ -f "$marker" ]; then
    standalone="$(tr -d '\n' < "$marker")"
  fi
  if [ -z "$standalone" ] || [ ! -f "$standalone/server.js" ]; then
    standalone="$site/.next/standalone"
  fi

  if [ ! -f "$standalone/server.js" ]; then
    echo "  skip (no standalone yet): $site"
    # Still drop caches / node_modules if present and not mid-build protected
    if [ -f "$site/.keep-build" ]; then
      echo "  .keep-build set — leaving build dirs"
      return 0
    fi
    rm -rf "$site/node_modules" "$site/.next/cache" 2>/dev/null || true
    return 0
  fi

  if [ -f "$site/.keep-build" ]; then
    echo "  skip (build in progress): $site"
    return 0
  fi

  echo "  slim: $site"
  rm -rf "$site/node_modules"
  # Never delete inside standalone — only siblings under .next/
  if [ -d "$site/.next" ]; then
    rm -rf "$site/.next/cache" "$site/.next/server" "$site/.next/static"
    find "$site/.next" -maxdepth 1 -type f ! -name 'standalone-app-dir.txt' -delete 2>/dev/null || true
  fi
  # Truncate PM2-style logs in project
  if [ -d "$site/logs" ]; then
    find "$site/logs" -type f -name '*.log' -exec truncate -s 0 {} \; 2>/dev/null || true
  fi
}

echo "==> Slimming sites in $WWW_ROOT"
for site in "$WWW_ROOT"/*; do
  [ -d "$site" ] || continue
  # skip non-app dirs
  case "$(basename "$site")" in
    html|cgi-bin|.*) continue ;;
  esac
  slim_one_site "$site"
done

echo
echo "==> Global caches / junk"
npm cache clean --force >/dev/null 2>&1 || true
rm -rf /root/.npm/_cacache /home/*/.npm/_cacache 2>/dev/null || true
rm -rf /tmp/npm-* /tmp/next-* 2>/dev/null || true

# Only if Docker exists — often the 100GB+ killer
if command -v docker >/dev/null 2>&1; then
  echo "==> Docker prune (images/volumes unused)"
  docker system prune -af --volumes 2>/dev/null || true
fi
if [ -d /var/lib/containerd ]; then
  echo "NOTE: /var/lib/containerd still present — if unused, uninstall docker/containerd later"
  du -sh /var/lib/containerd 2>/dev/null || true
fi

pm2 flush 2>/dev/null || true

apt-get clean -y >/dev/null 2>&1 || true
apt-get autoremove -y >/dev/null 2>&1 || true
journalctl --vacuum-time=3d >/dev/null 2>&1 || true
journalctl --vacuum-size=100M >/dev/null 2>&1 || true

find /tmp -type f -mtime +1 -delete 2>/dev/null || true
find /var/tmp -type f -mtime +1 -delete 2>/dev/null || true

# Old Next/npm leftovers anywhere under www
find "$WWW_ROOT" -type d -name '.next' -prune -o -type d -name 'node_modules' -print 2>/dev/null | while read -r nm; do
  site_dir="$(dirname "$nm")"
  if [ -f "$site_dir/.next/standalone/server.js" ] || [ -f "$site_dir/.next/standalone-app-dir.txt" ]; then
    if [ ! -f "$site_dir/.keep-build" ]; then
      echo "  remove leftover node_modules: $nm"
      rm -rf "$nm"
    fi
  fi
done

echo
echo "==> Disk AFTER"
df -h / | tail -1
echo
echo "==> Largest sites"
du -sh "$WWW_ROOT"/* 2>/dev/null | sort -hr | head -20
echo
echo "==> Biggest folders on /"
du -xh / --max-depth=2 2>/dev/null | sort -hr | head -25 || true
echo
echo "Done. Build only ONE site at a time; after each: SLIM=1 bash deploy/pm2-fast.sh"
echo "Protect an in-progress build: touch /var/www/SITE/.keep-build"
