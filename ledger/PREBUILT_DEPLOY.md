# Pre-built deploy (self-contained protectont.ca)

When Render’s build step doesn’t produce `ledger/out` or `static/protectont` at runtime, you can make the deploy self-contained by committing a pre-built copy of the Ledger in the **Flask/deployed repo**.

## 1. Build the artifact (in this repo, FFord)

```bash
./scripts/build-for-prebuilt-deploy.sh
```

This runs `npm run build:protectont` and copies the static export into `prebuilt-for-deploy/`. That folder is gitignored here so we don’t commit the build in FFord.

## 2. Copy into the deployed repo

In the repo that Render deploys (e.g. DarkAI-consolidated):

- Create the target directory if needed:
  - `ledger/out/` **or** `static/protectont/` (whichever your Flask app’s `_ledger_dir()` checks first).
- Copy the **contents** of FFord’s `prebuilt-for-deploy/` into that directory (so `index.html`, `_next/`, etc. are directly inside `ledger/out/` or `static/protectont/`).

Example from the deployed repo root:

```bash
# If your Flask app serves from ledger/out:
mkdir -p ledger/out
cp -r /path/to/FFord/prebuilt-for-deploy/. ledger/out/

# Or if it serves from static/protectont:
mkdir -p static/protectont
cp -r /path/to/FFord/prebuilt-for-deploy/. static/protectont/
```

## 3. Commit and push

Commit the copied files in the **deployed** repo and push. Render will deploy with those files present, so protectont.ca will serve the Ledger even if the Render build step doesn’t run or fails.

## 4. When you update the Ledger

After changing the Ledger in FFord:

1. Run `./scripts/build-for-prebuilt-deploy.sh` again.
2. Copy `prebuilt-for-deploy/` into the deployed repo’s `ledger/out/` or `static/protectont/` (overwriting).
3. Commit and push the deployed repo.

## Downsides

See the tradeoffs (repo size, stale builds, merge noise) discussed earlier; this is a practical workaround until Render’s build/copy step is fixed.
