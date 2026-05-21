# Updating events on protectont.ca

Protect Ontario does **not** use logins or per-group editor accounts. Events are curated centrally and published through git deploy.

## For organizers

- To suggest a rally: use the **contact form on [/about](https://protectont.ca/about)** with title, date, location, and event link.
- You do not need access to `/admin-events`.

## For site maintainers

1. Open **`/admin-events`** on a local or preview build (or edit `ledger/public/data/protests.json` directly).
2. Add/remove events. Use dates like `May 30, 2026 · 2:00 PM` so the calendar parses correctly.
3. Download **`protests.json`** and save it to **`ledger/public/data/protests.json`**.
4. From repo root:

   ```bash
   ./scripts/verify-protectont-before-deploy.sh
   ```

5. Commit **`ledger/`** and **`static/protectont/`**, then push to deploy.

Legacy URL **`/admin`** redirects to **`/admin-events`**.
