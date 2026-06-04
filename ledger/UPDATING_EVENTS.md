# Updating events on protectont.ca

Protect Ontario does **not** use logins or per-group editor accounts. Events are curated centrally.

## For organizers

- To suggest a rally: use the **contact form on [/about](https://protectont.ca/about)** with title, date, location, and event link.
- You do not need access to `/admin-events`.

## For site maintainers (live save)

1. Open **`/admin-events`** on protectont.ca (keep the URL private among your team).
2. Add, edit, or remove events and tap **Save** — changes go live for **all visitors** immediately.
3. Banner and “last updated” fields auto-save after you stop typing.

No Render env var or browser key is required. Optional: set **`PROTECTONT_EVENTS_DISABLE_SAVE=1`** on the server to block writes in an emergency.

Optional: **Download backup** exports a JSON copy for git or disaster recovery.

If live save is unavailable, use **Download backup** and deploy via git:

```bash
# Save backup to ledger/public/data/protests.json, then:
./scripts/verify-protectont-before-deploy.sh
```

Commit **`ledger/`** and **`static/protectont/`**, then push.

Re-run migration helper (optional): `node scripts/migrate-protests-json.mjs`

Legacy URL **`/admin`** redirects to **`/admin-events`**.
