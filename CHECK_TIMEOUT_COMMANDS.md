# Commands to Check for Build Timeout

## In Render Shell - Check for Timeout Indicators

```bash
# 1. Check if build process is still running or was killed
ps aux | grep -i "next\|node\|npm" | grep -v grep

# 2. Check build log for timeout/kill signals
tail -200 /tmp/ledger-build-diagnostic.log 2>&1 | grep -i "timeout\|killed\|signal\|terminated\|SIGKILL\|SIGTERM"

# 3. Check when build started (if log exists)
if [ -f /tmp/ledger-build-diagnostic.log ]; then
  echo "Build log last modified:"
  stat -c %y /tmp/ledger-build-diagnostic.log 2>/dev/null || ls -la /tmp/ledger-build-diagnostic.log
  echo ""
  echo "First line (build start time):"
  head -5 /tmp/ledger-build-diagnostic.log
  echo ""
  echo "Last line (where it stopped):"
  tail -5 /tmp/ledger-build-diagnostic.log
fi

# 4. Check if .next exists but out/ doesn't (sign of timeout mid-build)
cd ledger
if [ -d ".next" ] && [ ! -d "out" ]; then
  echo "⚠️  .next/ exists but out/ doesn't - build may have timed out"
  echo "Checking .next build status:"
  ls -la .next/ | head -10
  echo ""
  echo "Checking for build artifacts:"
  find .next -name "*.json" -type f | head -5
fi
cd ..

# 5. Check Render build logs for timeout messages
echo "Check Render Dashboard → Your Service → Events → Latest Deploy"
echo "Look for: 'Build timeout' or 'Build killed' messages"
```

## Signs of Timeout

1. ✅ `.next/` directory exists (build started)
2. ❌ `out/` directory missing (build didn't finish)
3. No error message in logs, just stops
4. Build log ends abruptly without completion message
5. Render dashboard shows "Build timeout" or "Build killed"

## If It's Timing Out

### Option 1: Optimize Build (Keep Cache)
Don't clear `.next` on every build - only clear `out/`:

```bash
# Instead of: rm -rf .next out
# Use: rm -rf out  (keep .next cache)
```

### Option 2: Use Build Cache
Render supports build cache - we can cache `node_modules` and `.next`

### Option 3: Reduce Build Time
- Skip TypeScript checking during build (not recommended)
- Reduce dependencies
- Use incremental builds

