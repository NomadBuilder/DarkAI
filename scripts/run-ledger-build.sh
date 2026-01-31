#!/usr/bin/env bash
# Run the same Ledger build that Render runs. Use this to see build errors locally.
# From repo root: ./scripts/run-ledger-build.sh

set -e
cd "$(dirname "$0")/.."
LEDGER_DIR="ledger"

if [ ! -d "$LEDGER_DIR" ]; then
  echo "❌ $LEDGER_DIR/ not found. Run from DarkAI-consolidated repo root."
  exit 1
fi

echo "=========================================="
echo "📦 Building Ledger (same as Render)"
echo "=========================================="
echo "Current directory: $(pwd)"
cd "$LEDGER_DIR" || exit 1
echo "In ledger: $(pwd)"
echo ""

echo "🧹 Clearing .next and out..."
rm -rf .next out

echo ""
echo "📦 npm install..."
npm install --include=dev

echo ""
echo "🔨 npm run build:protectont (NODE_ENV=production)..."
export NODE_ENV=production
export NODE_OPTIONS="${NODE_OPTIONS:-} --max-old-space-size=4096"
if ! npm run build:protectont; then
  echo ""
  echo "❌ Build failed. Fix the error above, then push and redeploy."
  exit 1
fi

echo ""
echo "=========================================="
echo "✅ Checking output"
echo "=========================================="
if [ -f "out/index.html" ]; then
  echo "✅ out/index.html exists ($(wc -c < out/index.html) bytes)"
  echo "   First line: $(head -1 out/index.html)"
else
  echo "❌ out/index.html missing"
  exit 1
fi

echo ""
echo "Done. If this passed, the same build should work on Render."
echo "If Render still has no ledger/out, check that the build step runs (see deploy Build Log)."
