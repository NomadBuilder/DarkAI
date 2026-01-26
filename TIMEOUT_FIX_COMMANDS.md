# Commands to Diagnose and Fix Build Timeout

## In Render Shell - Get Full Details

```bash
# 1. Check the full build log to see where it stopped
tail -100 /tmp/ledger-build-diagnostic.log 2>&1

# 2. Check the END of the build log (most important)
tail -50 /tmp/ledger-build-diagnostic.log 2>&1

# 3. Check for any error messages
grep -i "error\|failed\|killed\|timeout" /tmp/ledger-build-diagnostic.log 2>&1 | tail -20

# 4. Check build duration
if [ -f /tmp/ledger-build-diagnostic.log ]; then
  echo "Build log size: $(wc -l < /tmp/ledger-build-diagnostic.log) lines"
  echo "First timestamp:"
  head -3 /tmp/ledger-build-diagnostic.log | grep -i "time\|date" || head -1 /tmp/ledger-build-diagnostic.log
  echo "Last timestamp:"
  tail -3 /tmp/ledger-build-diagnostic.log | grep -i "time\|date" || tail -1 /tmp/ledger-build-diagnostic.log
fi

# 5. Check what stage the build reached
cd ledger
echo "Checking build progress:"
if [ -f ".next/BUILD_ID" ]; then
  echo "✅ BUILD_ID exists"
  cat .next/BUILD_ID
fi
if [ -d ".next/static" ]; then
  echo "✅ Static assets generated"
  ls -la .next/static/ | head -5
fi
if [ -d ".next/server" ]; then
  echo "✅ Server build completed"
  ls -la .next/server/ | head -5
fi
cd ..
```

## Quick Fix: Try Manual Build with Time Limit

```bash
cd ledger
export PATH="/opt/render/project/nodes/node-22.16.0/bin:$PATH"
echo "Starting build at $(date)"
timeout 1800 NODE_ENV=production BASE_PATH=/ledger STATIC_EXPORT=true npm run build 2>&1 | tee /tmp/manual-build.log
echo "Build finished at $(date)"
test -d out && echo "✅ out/ created!" || echo "❌ out/ still missing"
cd ..
```

## If Build Times Out

The issue is that Next.js static export takes too long. Solutions:

1. **Enable build cache** (already done - keeping .next/)
2. **Reduce build scope** - Check if we can optimize
3. **Split build** - Build in stages
4. **Check Render plan** - Free plan has 45min timeout
