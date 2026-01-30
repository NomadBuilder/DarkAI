# Build Command Fix for Render

## The Issue

Your current build command has `npm install --include=dev` which is **not a valid npm flag**. This causes npm install to fail silently, so the build never runs.

## The Fix

Replace this part of your build command:
```bash
npm install --include=dev
```

With:
```bash
npm install
```

`npm install` already installs dev dependencies by default, so the `--include=dev` flag is unnecessary and causes errors.

## Complete Fixed Build Command

```bash
pip install -r requirements.txt && if [ -d "ledger" ]; then export PATH="/opt/render/project/nodes/node-22.16.0/bin:$PATH" && cd ledger && rm -rf .next out node_modules && npm install && NODE_ENV=production BASE_PATH=/ledger STATIC_EXPORT=true npm run build && cd .. && echo "✅ Ledger build completed" || echo "❌ Ledger build failed";
```

**Only change:** Removed `--include=dev` from `npm install`

## Why This Fixes It

1. `npm install` works correctly (installs all dependencies including dev)
2. The build will actually run now
3. The `out/` directory will be created
4. Flask route will find `ledger/out/index.html`

## Next Steps

1. Update the build command in `darkai-consolidated/render.yaml`
2. Commit and push
3. Render will rebuild with the fixed command
4. The ledger should work at `darkai.ca/ledger`

## Alternative: If You Must Keep Current Command

If you absolutely cannot change the build command, update the Flask route in `darkai-consolidated/app.py` to use the improved version in `FLASK_ROUTE_IMPROVED.txt`. This will at least give you diagnostic information about what's wrong.

But the **real fix** is removing `--include=dev` from the build command.
