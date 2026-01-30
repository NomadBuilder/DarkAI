# Deploy Protect Ontario at ProtectOnt.ca (Option A)

Option A: **ProtectOnt.ca** serves the Ledger app at the **root**; **darkai.ca/ledger** redirects to ProtectOnt.ca. Same Render service, no extra cost.

## 1. Build the Ledger for root (no base path)

In **this repo** (FFord / Ledger), build the static export **without** `BASE_PATH` so assets are at `/_next/...` and `/data/...` (not `/ledger/...`):

```bash
npm run build:protectont
```

This runs `STATIC_EXPORT=true next build` with no `BASE_PATH`, so the output in `out/` is suitable for serving at the root of ProtectOnt.ca.

## 2. Copy output into darkai-consolidated

Copy the contents of `out/` into your **darkai-consolidated** repo’s Ledger output directory so Flask can serve them:

- **If** the consolidated app expects the Ledger at `ledger/out/`, copy this repo’s `out/*` into that `ledger/out/` (replace or merge as needed).
- Your Render build for darkai-consolidated should produce `ledger/out/` (e.g. by building this repo as a step and copying `out/` → `ledger/out/`).

## 3. Add Flask routing (Option A)

In your **darkai-consolidated** Flask app (e.g. `app.py`):

1. Add the code from **`FLASK_ROUTE_PROTECTONT_OPTION_A.txt`** (the `is_protect_ontario_domain`, `serve_ledger_at_root`, and `before_request` logic).
2. **Remove or comment out** the old `/ledger` routes (from `FLASK_ROUTE_MINIMAL.txt`) so that on darkai.ca, `/ledger` and `/ledger/*` are handled only by the new redirect to ProtectOnt.ca.

Result:

- **protectont.ca** and **www.protectont.ca** → Ledger static app at root (`/`, `/receipts`, `/water`, etc.).
- **darkai.ca** → existing site; **darkai.ca/ledger** and **darkai.ca/ledger/*** → 302 redirect to **https://protectont.ca/** (or the same path on ProtectOnt.ca).

## 4. DNS (Render)

In Render, add the custom domains **protectont.ca** and **www.protectont.ca** to the **same** web service that serves darkai.ca (as in your screenshot). Point DNS as instructed (ANAME/ALIAS or A for root, CNAME for `www`). No separate web service is required.

## 5. Deploy

Deploy darkai-consolidated to Render as usual. After DNS propagates, **https://protectont.ca** will serve the Ledger at root, and **https://darkai.ca/ledger** will redirect to **https://protectont.ca**.

---

## Certificate errors after adding ProtectOnt.ca

If **Domain Verified** is green but **Certificate Error** appears for both protectont.ca and darkai.ca (and their www variants) after adding the new domains, it’s usually one of these:

1. **Re-issuance on add** – Adding protectont.ca (and www) to the same Render service can trigger re-validation/re-issuance for *all* custom domains. A temporary failure (rate limit, CA delay, or platform hiccup) can show cert errors for every domain on that service, even ones that were fine before.
2. **DNS still propagating** – New A/CNAME records for protectont.ca can take time. Render needs to complete HTTP-01 (or DNS-01) validation; if DNS isn’t fully propagated, issuance can fail and sometimes affect the whole batch.
3. **Duplicate or wrong records** – For each hostname there should be exactly one A/ANAME or CNAME pointing at Render (as shown in the Render dashboard). Extra records or typos can break validation.

**What to do:**

- **Wait and retry** – The message says to contact support if it persists **over an hour**. Often issuance succeeds on a later automatic retry.
- **Check DNS** – In your DNS provider, confirm for **protectont.ca** and **www.protectont.ca** that you have the records Render shows (e.g. A/ALIAS for root, CNAME for www), and no conflicting records.
- **Re-save domains in Render** – In the service’s **Settings → Custom Domains**, try removing and re-adding protectont.ca (and www) once DNS is correct, then let Render retry issuance.
- **Contact Render support** – If cert errors are still there after an hour and DNS is correct, contact support with a screenshot of the Custom Domains page (Domain Verified ✓ but Certificate Error ✗). They can see why issuance failed and often fix or re-trigger it.

This is a hosting/DNS issue, not an application code issue; the app doesn’t control SSL issuance.
