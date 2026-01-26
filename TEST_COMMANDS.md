# Testing Commands - Run These to Isolate the Issue

## Test 1: Check TypeScript Errors Locally First

```bash
cd ledger
npm install
./node_modules/.bin/tsc --noEmit 2>&1 | tee /tmp/tsc-errors.log
```

**What to look for:**
- Any TypeScript errors
- Import errors
- Type mismatches

**If errors found:** Fix them, then try build

## Test 2: Test Build Locally (Before Render)

```bash
cd ledger
rm -rf .next out
NODE_ENV=production BASE_PATH=/ledger STATIC_EXPORT=true npm run build
```

**What to look for:**
- Does it complete?
- How long does it take?
- Any errors?

**If it works locally but fails on Render:** Environment difference

## Test 3: Disable New Pages (Isolate Issue)

### Option A: Use the Script
```bash
bash scripts/test-build-isolation.sh
# Then try build
# If it works, new pages are the problem
```

### Option B: Manual (In Render Shell)
```bash
cd ledger/app
mv about about.disabled
mv water water.disabled  
mv water_billcalculator water_billcalculator.disabled

# Try build
cd ../..
# (run build command)

# Restore if needed
cd ledger/app
mv about.disabled about
mv water.disabled water
mv water_billcalculator.disabled water_billcalculator
```

## Test 4: Test Each Page Individually

```bash
# Start with just original pages (should work)
# Then add one at a time:

# Add /about
cd ledger/app
mv about.disabled about
# Try build

# Add /water  
mv water.disabled water
# Try build

# Add /water_billcalculator
mv water_billcalculator.disabled water_billcalculator
# Try build
```

## Test 5: Check Render Build Logs

In Render Dashboard:
1. Go to your service
2. Click "Events" tab
3. Click latest deploy
4. Look for:
   - TypeScript errors
   - Build failures
   - Timeout messages
   - Memory errors

## Test 6: Manual Build in Render Shell

```bash
cd ledger
export PATH="/opt/render/project/nodes/node-22.16.0/bin:$PATH"
rm -rf .next out
npm install
NODE_ENV=production BASE_PATH=/ledger STATIC_EXPORT=true npm run build 2>&1 | tee /tmp/manual-build.log

# Check result
if [ -d "out" ]; then
  echo "✅ Build succeeded!"
  ls -la out/ | head -10
else
  echo "❌ Build failed"
  echo "Last 50 lines of log:"
  tail -50 /tmp/manual-build.log
fi
```

## Recommended Testing Order

1. **Test 1** - Check TypeScript errors locally
2. **Test 2** - Test build locally  
3. **Test 3** - Disable new pages, test on Render
4. **Test 4** - Add pages one at a time
5. **Test 5** - Check Render logs for actual error

