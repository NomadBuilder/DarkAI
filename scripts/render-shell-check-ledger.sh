#!/usr/bin/env bash
# Paste these commands into Render Dashboard → darkai-consolidated → Shell
# to see why ledger/out is missing at runtime.

echo "=== 1. Where we are and project root ==="
pwd
ls -la

echo ""
echo "=== 2. Does ledger/ exist? ==="
ls -la ledger/ 2>/dev/null || echo "ledger/ NOT FOUND"

echo ""
echo "=== 3. Does ledger/out/ exist? (this is what app.py needs) ==="
ls -la ledger/out/ 2>/dev/null || echo "ledger/out/ NOT FOUND"

echo ""
echo "=== 4. If ledger/ exists: package.json and node_modules? ==="
test -f ledger/package.json && echo "ledger/package.json: YES" || echo "ledger/package.json: NO"
test -d ledger/node_modules && echo "ledger/node_modules: YES" || echo "ledger/node_modules: NO"
test -d ledger/.next && echo "ledger/.next: YES" || echo "ledger/.next: NO"

echo ""
echo "=== 5. Path app.py uses for LEDGER_DIR ==="
echo "Expected: $(pwd)/ledger/out"
test -f ledger/out/index.html && echo "ledger/out/index.html: EXISTS" || echo "ledger/out/index.html: MISSING"
