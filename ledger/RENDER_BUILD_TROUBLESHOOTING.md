# Render: "Protect Ontario app not built yet" (503)

If https://protectont.ca shows JSON `"error": "Protect Ontario app not built yet"`, **host detection is working** but **`ledger/out` is missing** on the server (path: `/opt/render/project/src/ledger/out`).

## What to do

1. **Open Render Dashboard** → your **darkai-consolidated** service → **Events** (or **Logs**).
2. Open the **latest deploy** and look at the **Build Log** (not Runtime Logs).
3. Find the section **"📦 Building Ledger"** and scroll to the end of that section.

### If you see "❌ Build failed" or "exit 1"

The Ledger build step failed. In the same build log, look for:

- **"Last 50 lines of diagnostic log"** – the real error is there (e.g. TypeScript error, missing module, out-of-memory).
- **Node/npm errors** – e.g. `npm install` or `npm run build:protectont` failing.

Common fixes:

- **Out of memory**: The build now sets `NODE_OPTIONS=--max-old-space-size=4096`. If it still OOMs, in Render Dashboard → Environment add `NODE_OPTIONS` = `--max-old-space-size=6144`.
- **Missing module / TS error**: Fix the reported error in the ledger app and push again.
- **Node version**: Ensure **NODE_VERSION=22.16.0** (or compatible) is set in Render env.

### If you see "✅ Ledger build successful!"

Then `ledger/out` was created during the build. If the app still returns 503:

- Confirm the **same deploy** that shows "Ledger build successful!" is the one currently **live** (not an older one).
- If you use a **Dockerfile** or custom build, the run step must use the same filesystem as the build (same image/workspace); otherwise the run step won’t see `ledger/out`.

## Quick check from the app

After deploy, open:

**https://protectont.ca/_ledger-status**

You’ll see JSON with `ledger_dir_exists` and `ledger_index_exists`. If both are `false`, the Ledger build didn’t produce `ledger/out` (or it’s in a different place at runtime).
