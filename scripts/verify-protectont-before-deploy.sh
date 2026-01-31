#!/usr/bin/env bash
# Run before deploying: build Ledger, copy to static/protectont, verify app would serve it.
# From repo root: ./scripts/verify-protectont-before-deploy.sh
# Exit 0 = ready to deploy; non-zero = fix first.

set -e
cd "$(dirname "$0")/.."
REPO_ROOT=$(pwd)

echo "=========================================="
echo "1. Build Ledger (same as Render)"
echo "=========================================="
./scripts/run-ledger-build.sh || { echo "❌ Ledger build failed"; exit 1; }

echo ""
echo "=========================================="
echo "2. Copy ledger/out -> static/protectont (same as Render)"
echo "=========================================="
mkdir -p static/protectont
cp -r ledger/out/* static/protectont/
echo "✅ static/protectont populated"
test -f static/protectont/index.html || { echo "❌ static/protectont/index.html missing"; exit 1; }
echo "   index.html: $(wc -c < static/protectont/index.html) bytes"

echo ""
echo "=========================================="
echo "3. Verify _ledger_dir() would pick static/protectont"
echo "=========================================="
# Simulate app.py _ledger_dir(): check static/protectont first, then ledger/out
if [ -d "static/protectont" ] && [ -f "static/protectont/index.html" ]; then
  echo "✅ static/protectont exists with index.html (app will serve from here)"
elif [ -d "ledger/out" ] && [ -f "ledger/out/index.html" ]; then
  echo "✅ ledger/out exists (app would serve from ledger/out)"
else
  echo "❌ Neither static/protectont nor ledger/out has index.html"
  exit 1
fi

echo ""
echo "=========================================="
echo "4. Optional: start Flask and request ProtectOnt root (Ctrl+C to skip)"
echo "=========================================="
echo "Run this manually to test live:"
echo "  SKIP_BLUEPRINTS=1 PORT=5050 python3 app.py &"
echo "  sleep 5"
echo "  curl -s -o /dev/null -w '%{http_code}' -H 'Host: protectont.ca' http://127.0.0.1:5050/"
echo "  # Expect 200. Then: curl -s -H 'Host: protectont.ca' http://127.0.0.1:5050/_ledger-status | python3 -m json.tool"
echo ""

echo "=========================================="
echo "✅ Pre-deploy check passed. Safe to push and deploy."
echo "=========================================="
