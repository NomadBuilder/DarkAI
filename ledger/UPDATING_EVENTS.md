# Updating events on protectont.ca

Protect Ontario does **not** use logins or per-group editor accounts. Events are curated centrally.

## For organizers

- To suggest a rally: use the **contact form on [/about](https://protectont.ca/about)** with title, date, location, and event link.
- You do not need access to `/admin-events`.

## For site maintainers (auto-save)

1. On Render (or local `.env`), set **`PROTECTONT_EVENTS_ADMIN_TOKEN`** to a long random secret.
2. Open **`/admin-events`** on protectont.ca.
3. Enter that secret under **Publish key** and tap **Remember key** (stored in your browser only).
4. Add, edit, or remove events and tap **Save** — changes publish to the live site immediately (no download step).
5. Banner and “last updated” fields auto-save after you stop typing.

Optional: **Download backup** exports a JSON copy for git or disaster recovery.

If auto-save is unavailable (token not set on the server), use **Download backup** and deploy via git:

```bash
# Save backup to ledger/public/data/protests.json, then:
./scripts/verify-protectont-before-deploy.sh
```

Commit **`ledger/`** and **`static/protectont/`**, then push.

Re-run migration helper (optional): `node scripts/migrate-protests-json.mjs`

Legacy URL **`/admin`** redirects to **`/admin-events`**.
