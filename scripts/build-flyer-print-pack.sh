#!/usr/bin/env bash
# Build Community Action Pack ZIP (5 letter-size PDFs).
# From repo root: ./scripts/build-flyer-print-pack.sh
# Requires static/protectont — run ./scripts/verify-protectont-before-deploy.sh first if stale.

set -e
cd "$(dirname "$0")/.."

if [ ! -d static/protectont ] || [ ! -f static/protectont/index.html ]; then
  echo "❌ static/protectont missing — run ./scripts/verify-protectont-before-deploy.sh first"
  exit 1
fi

echo "Installing ledger dev deps (playwright) if needed…"
(cd ledger && npm install --no-audit --no-fund)

if [ "${PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD:-}" != "1" ]; then
  echo "Ensuring Playwright Chromium is installed…"
  (cd ledger && npx playwright install chromium)
fi

(cd ledger && node scripts/build-flyer-print-pack.mjs)
