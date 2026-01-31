# Get More Info Before the Next Deploy (No Redeploy Needed)

Use these **before** pushing again so you don’t have to wait 10 minutes just to see the same 503.

---

## 1. Run local “build + copy” verification (2 min)

From **DarkAI-consolidated** repo root:

```bash
./scripts/verify-protectont-before-deploy.sh
```

This will:

- Build the Ledger (same as Render).
- Copy `ledger/out` → `static/protectont` (same as the new Render step).
- Check that `static/protectont/index.html` exists so `_ledger_dir()` would pick it.

If this **passes**, the app logic and copy step are correct; the remaining risk is only “does Render keep `static/protectont` at runtime?”

---

## 2. From the **current** Render Shell (live instance)

Run this on the **already deployed** instance (Dashboard → Shell). It won’t fix anything but tells you what’s on disk **right now**:

```bash
echo "=== Repo root ===" && pwd
echo "" && echo "=== ledger/out? ===" && ls -la ledger/out 2>/dev/null || echo "ledger/out NOT FOUND"
echo "" && echo "=== static/protectont? (not deployed yet) ===" && ls -la static/protectont 2>/dev/null || echo "static/protectont NOT FOUND"
echo "" && echo "=== ledger/.gitignore (out?) ===" && grep -n "out" ledger/.gitignore 2>/dev/null || true
echo "" && echo "=== ledger/.renderignore ===" && cat ledger/.renderignore 2>/dev/null | head -10
echo "" && echo "=== static/ contents ===" && ls -la static/ 2>/dev/null || true
```

What it tells you:

- Whether `ledger/out` exists on the **current** runtime (we expect NOT FOUND).
- Whether `ledger/out` is in `ledger/.gitignore` (so Render might exclude it).
- What’s in `static/` (after the next deploy we’ll have `static/protectont` there).

---

## 3. From the **last** deploy’s Build Log (in Render dashboard)

For the deploy that is **currently live** (the one returning 503):

1. **Dashboard** → **darkai-consolidated** → **Events** → open the **latest deploy**.
2. Open the **Build** log (not the runtime log).
3. Search for:
   - `Ledger build successful` or `Ledger build failed`
   - `out/ exists` or `out/index.html`
   - `npm run build:protectont` and any error right after it

Interpretation:

- **“Ledger build successful” + “out/index.html exists”**  
  → Build is creating `ledger/out`; the problem is that the **runtime** doesn’t have it (e.g. excluded by ignore rules). The **copy to static/protectont** in the next deploy is meant to fix that.

- **“Build failed” or “out/ directory NOT found”**  
  → Build is failing (e.g. npm, Node, or Next.js error). Fix that first; the “Last 50 lines of diagnostic log” in the same build log will have the real error.

- **No “Building Ledger” / “Ledger build” section at all**  
  → The Ledger build step might be skipped or in a different place; check that the `render.yaml` in the repo that Render uses really has the Ledger block and the new copy step.

---

## 4. After the **next** deploy (with copy step)

Once you’ve pushed the change that copies `ledger/out` → `static/protectont` and redeployed:

1. **Shell** (same commands as in section 2):  
   - Confirm `static/protectont` exists and has `index.html`.  
   - Confirm `ledger/out` or not (for comparison).

2. **Browser**:  
   - `https://protectont.ca/` → should be the Ledger, not 503.  
   - `https://protectont.ca/_ledger-status` → `ledger_dir` should be `.../static/protectont`, `ok: true`.

---

## Summary

| What you want | Where | Action |
|---------------|--------|--------|
| “Will app + copy logic work?” | Local | Run `./scripts/verify-protectont-before-deploy.sh` |
| “What’s on the live server now?” | Render Shell | Run the block in section 2 |
| “Did the last build create ledger/out?” | Render Build Log | Check for “Ledger build successful” and “out/” in the **last** deploy’s build log |
| “Did the new deploy get static/protectont?” | After next deploy | Shell: `ls static/protectont`; browser: `/_ledger-status` |

Running (1) and (2) before pushing again gives you the most information without waiting for another deploy.
