#!/bin/bash
# Quick diagnostic script to run in Render shell

cd /opt/render/project/src/ledger

echo "=== 1. Check diagnostic log ==="
if [ -f /tmp/ledger-build-diagnostic.log ]; then
  echo "✅ Diagnostic log exists"
  echo "Last 100 lines:"
  tail -100 /tmp/ledger-build-diagnostic.log
else
  echo "❌ Diagnostic log not found"
fi

echo ""
echo "=== 2. Check if build ran ==="
if [ -d ".next" ]; then
  echo "✅ .next/ exists - build ran"
  ls -la .next/ | head -10
else
  echo "❌ .next/ does NOT exist - build never ran or failed immediately"
fi

echo ""
echo "=== 3. Check Node.js ==="
export PATH="/opt/render/project/nodes/node-22.16.0/bin:$PATH"
echo "Node.js: $(node --version 2>&1)"
echo "npm: $(npm --version 2>&1)"
echo "Node path: $(which node 2>&1)"

echo ""
echo "=== 4. Check critical files ==="
test -f "package.json" && echo "✅ package.json" || echo "❌ package.json missing"
test -f "next.config.js" && echo "✅ next.config.js" || echo "❌ next.config.js missing"
test -f "postcss.config.js" && echo "✅ postcss.config.js" || echo "❌ postcss.config.js missing"

echo ""
echo "=== 5. Check if dependencies are installed ==="
if [ -d "node_modules" ]; then
  echo "✅ node_modules/ exists"
  echo "Checking critical packages:"
  npm list typescript tailwindcss postcss autoprefixer 2>&1 | head -10
else
  echo "❌ node_modules/ does NOT exist"
fi

echo ""
echo "=== 6. Try manual build (last 50 lines) ==="
export PATH="/opt/render/project/nodes/node-22.16.0/bin:$PATH"
NODE_ENV=production BASE_PATH=/ledger STATIC_EXPORT=true npm run build 2>&1 | tail -50
