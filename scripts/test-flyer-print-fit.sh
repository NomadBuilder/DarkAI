#!/usr/bin/env bash
# Test every published flyer fits on one letter page when printed.
# From repo root: ./scripts/test-flyer-print-fit.sh
# Skip Playwright browser download if already installed: PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

set -e
cd "$(dirname "$0")/.."

if [ ! -d static/protectont ] || [ ! -f static/protectont/index.html ]; then
  echo "❌ static/protectont missing — run ./scripts/verify-protectont-before-deploy.sh first"
  exit 1
fi

echo "Installing ledger dev deps (playwright, pdf-lib) if needed…"
(cd ledger && npm install --no-audit --no-fund)

if [ "${PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD:-}" != "1" ]; then
  echo "Ensuring Playwright Chromium is installed…"
  (cd ledger && npx playwright install chromium)
fi

(cd ledger && node scripts/test-flyer-print-fit.mjs "$@")
