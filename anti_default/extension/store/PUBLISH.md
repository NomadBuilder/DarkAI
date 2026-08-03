# Publish Anti-Default to the Chrome Web Store

## 1. Build the upload zip

From `anti_default/`:

```bash
npm run extension:pack
```

Creates `extension/store/anti-default-extension.zip` (runtime files only — no store docs).

## 2. Confirm privacy page is live

After deploy, open:

https://darkai.ca/anti-default/privacy/

Paste that URL into the store listing **Privacy policy** field.

## 3. Developer Dashboard steps

1. Open https://chrome.google.com/webstore/devconsole (you already paid the $5 fee).
2. **New item** → upload `anti-default-extension.zip`.
3. Fill fields from `store/LISTING.md` (name, descriptions, category, single purpose).
4. Upload screenshots from `store/assets/`.
5. Complete **Privacy practices** (no data collection / preferences only — see LISTING.md).
6. Justify `storage` + content-script host access (copy from LISTING.md).
7. Set visibility: **Public** (or Unlisted while testing).
8. Submit for review.

## 4. Review tips

- Keep the package free of `eval`, remote script tags, and minified mystery bundles.
- Current package is plain JS + local `rules.json`.
- First review often takes a few days; reply promptly if Google asks questions.

## 5. After approval

- Share the store URL on https://darkai.ca/anti-default/
- For updates: bump `manifest.json` `version`, run `npm run extension:pack`, upload a new package.

## Edge Add-ons (optional)

You can reuse the same zip at https://partner.microsoft.com/dashboard/microsoftedge/overview after a separate partner registration.
