# Updating the join form on protectont.ca

## Editors

1. Open **`/form-admin`** (keep the URL private).
2. Edit question text, the four involvement options, submit button, footer, and thank-you copy.
3. Tap **Publish** — **`/join`** updates immediately for all visitors.

Sign-ups still go to the Google Sheet / email flow; only on-page wording changes.

## After publishing (git, optional but recommended)

Publish writes live JSON on the server. To survive the next Render deploy from git, also:

```bash
# If you edited locally, rebuild static bundle:
./scripts/verify-protectont-before-deploy.sh

# Commit both copies of the JSON:
git add ledger/public/data/get-involved-form.json static/protectont/data/get-involved-form.json static/protectont/
git commit -m "ProtectOnt: update join form copy"
git push origin main
```
