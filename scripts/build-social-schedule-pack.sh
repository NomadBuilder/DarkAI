#!/usr/bin/env bash
# Export numbered social PNGs + schedule.csv for Meta Business Suite.
# From repo root: ./scripts/build-social-schedule-pack.sh
# Requires static/protectont — run verify-protectont first if stale.

set -e
cd "$(dirname "$0")/.."

if [ ! -d static/protectont ] || [ ! -f static/protectont/index.html ]; then
  echo "❌ static/protectont missing — run ./scripts/verify-protectont-before-deploy.sh first"
  exit 1
fi

echo "Syncing social-post-ideas.json from library defaults…"
(cd ledger && npx --yes tsx scripts/sync-social-ideas-json.ts)

echo "Installing ledger dev deps if needed…"
(cd ledger && npm install --no-audit --no-fund)

if [ "${PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD:-}" != "1" ]; then
  echo "Ensuring Playwright Chromium…"
  (cd ledger && npx playwright install chromium)
fi

(cd ledger && node scripts/build-social-schedule-pack.mjs)

# Keep static bundle JSON in sync
mkdir -p static/protectont/data
cp -f ledger/public/data/social-post-ideas.json static/protectont/data/social-post-ideas.json

echo "✅ social-post-ideas.json synced to static/protectont/data/"
