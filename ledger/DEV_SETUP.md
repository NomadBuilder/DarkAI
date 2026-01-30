# Development Setup

## Quick Start

```bash
# Clean start (clears cache and restarts)
npm run dev:clean

# If you get 500 errors, use reset
npm run dev:reset
```

## Auto-Reload

Next.js has built-in hot reloading. If you see 500 errors:

1. **Quick fix**: Refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
2. **If that doesn't work**: Run `npm run dev:reset`
3. **Check console**: Look for build errors in terminal

## Common Issues

### 500 Internal Server Error
- **Cause**: Build cache corruption or code errors
- **Fix**: Run `npm run dev:reset` to clear cache and restart

### Bubbles not showing
- **Check**: Browser console (F12) for errors
- **Check**: Terminal for "Year X: Y vendors" logs
- **Fix**: Ensure data files exist in `public/data/processed/`

### Hot reload not working
- Next.js should auto-reload on file changes
- If not, restart with `npm run dev:reset`

### 404 on /water, /receipts, or “page.js” / blank page
- **Fix:** Clear the Next cache and restart: run **`npm run dev:clean`** (or `rm -rf .next && npm run dev`), then open **http://localhost:3000/water**, **http://localhost:3000/receipts**, etc. In dev, basePath is forced off so script chunks load from the root.
- **Use the dev server for local work:** run `npm run dev` and open routes at the root (e.g. **http://localhost:3000/receipts**, **http://localhost:3000/water**). If you use a base path in production (e.g. BASE_PATH=/ledger), test that build at **http://localhost:3000/ledger/...** or run `npm run dev` and use root URLs.
