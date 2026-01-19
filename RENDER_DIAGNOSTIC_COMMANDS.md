# Render Diagnostic Commands

Run these commands in the Render shell to diagnose build issues:

## Quick Diagnostic

```bash
# Check if ledger/out exists
ls -la ledger/out/ 2>&1

# Check diagnostic log from last build
cat /tmp/ledger-build-diagnostic.log 2>&1 | tail -100
```

## Full Diagnostic

```bash
# 1. Check ledger directory
echo "=== Ledger Directory ==="
ls -la ledger/ | head -20

# 2. Check if build ran
echo ""
echo "=== Build Status ==="
ls -la ledger/.next/ 2>&1 | head -5 || echo "No .next/ (build hasn't run)"
ls -la ledger/out/ 2>&1 | head -5 || echo "No out/ (static export failed)"

# 3. Check package.json
echo ""
echo "=== Package.json ==="
cat ledger/package.json | grep -A 10 '"dependencies"'

# 4. Check Node.js
echo ""
echo "=== Node.js Environment ==="
export PATH="/opt/render/project/nodes/node-22.16.0/bin:$PATH"
node --version
npm --version

# 5. Try manual build
echo ""
echo "=== Manual Build Test ==="
cd ledger
NODE_ENV=production BASE_PATH=/ledger STATIC_EXPORT=true npm run build 2>&1 | tail -30

# 6. Check result
echo ""
echo "=== Build Result ==="
test -d out && echo "✅ out/ exists" || echo "❌ out/ missing"
test -f out/index.html && echo "✅ index.html exists" || echo "❌ index.html missing"
```

## Get Diagnostic Log

After a build runs, the diagnostic log is saved to:
```bash
cat /tmp/ledger-build-diagnostic.log
```

This log contains:
- Build environment details
- Full build output
- Post-build verification
- File system checks
