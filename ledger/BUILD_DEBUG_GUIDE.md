# Build Debugging Guide

## Quick Start

### Test Locally (Before Deploying)

Run this to catch issues before they hit Render:

```bash
cd /Users/aazir/Desktop/Coding/personalprojects/FFord
bash scripts/test-build-render.sh
```

This script:
- ✅ Checks all critical files exist
- ✅ Verifies dependencies are in the right place
- ✅ Tests PostCSS config format
- ✅ Runs a clean install (simulating Render)
- ✅ Tests the build with Render environment variables
- ✅ Verifies build output

**If this passes locally, it should work on Render.**

### Debug on Render

If the build fails on Render, SSH into the Render shell and run:

```bash
cd /opt/render/project/src
bash ledger/scripts/render-build-debug.sh
```

Or if the script isn't there yet, copy and paste this:

```bash
cd /opt/render/project/src/ledger
export PATH="/opt/render/project/nodes/node-22.16.0/bin:$PATH"
rm -rf .next out node_modules
npm install
NODE_ENV=production BASE_PATH=/ledger STATIC_EXPORT=true npm run build
ls -la out/
```

## Common Issues & Solutions

### Issue: "Cannot find module 'typescript'"

**Cause**: TypeScript is in `devDependencies` instead of `dependencies`

**Fix**: Move to `dependencies` in `package.json`

**Check**: Run `grep -A 20 '"dependencies"' package.json | grep typescript`

### Issue: "Cannot find module 'tailwindcss'"

**Cause**: Tailwind is in `devDependencies` instead of `dependencies`

**Fix**: Move to `dependencies` in `package.json`

### Issue: "PostCSS plugin not found"

**Cause**: PostCSS config uses wrong format

**Fix**: Use object format:
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Check**: Run `cat postcss.config.js`

### Issue: Build succeeds but `out/` doesn't exist

**Cause**: Static export not enabled

**Fix**: Ensure `STATIC_EXPORT=true` is set during build

**Check**: Run `node -e "process.env.STATIC_EXPORT='true'; const c=require('./next.config.js'); console.log(c.output)"`

### Issue: "ledger/out/ does not exist" on Render

**Cause**: Build failed silently or directory not created

**Debug Steps**:
1. Check Render build logs for errors
2. SSH into Render shell
3. Run `bash ledger/scripts/render-build-debug.sh`
4. Check `/tmp/render-build-test.log` for full output

## Systematic Debugging Process

### Step 1: Test Locally First
```bash
bash scripts/test-build-render.sh
```

### Step 2: If Local Test Passes, Check Render Logs
- Go to Render Dashboard → Your Service → Logs
- Look for "Building Ledger" section
- Check for error messages

### Step 3: If Still Failing, SSH and Run Diagnostic
```bash
# In Render shell
cd /opt/render/project/src
bash ledger/scripts/render-build-debug.sh
```

### Step 4: Check Specific Issues
- **Node.js not found**: Check `NODE_VERSION` env var in Render
- **Dependencies missing**: Check `package.json` dependencies section
- **Build succeeds but no output**: Check `next.config.js` output setting
- **File not found**: Check `.gitignore` isn't excluding needed files

## Prevention Checklist

Before deploying, ensure:

- [ ] All build-time dependencies are in `dependencies` (not `devDependencies`)
- [ ] PostCSS config uses object format
- [ ] `next.config.js` has correct `output: 'export'` logic
- [ ] `package.json` has `engines` field for Node version
- [ ] Local test script passes: `bash scripts/test-build-render.sh`
- [ ] All critical files are committed to git
- [ ] `public/data/processed/` files are committed

## Quick Reference

**Test locally:**
```bash
bash scripts/test-build-render.sh
```

**Debug on Render:**
```bash
bash ledger/scripts/render-build-debug.sh
```

**Manual build test:**
```bash
cd ledger
rm -rf .next out node_modules
npm install
NODE_ENV=production BASE_PATH=/ledger STATIC_EXPORT=true npm run build
ls -la out/
```
