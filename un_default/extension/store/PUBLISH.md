# Publish Un-Default to the Chrome Web Store

## 1. Build the upload zip

From the repo root:

```bash
npm run extension:pack
```

Creates `extension/store/un-default-extension.zip` (runtime files only — not committed; regenerate before upload).

## 2. Confirm privacy page is live

After deploy, open:

https://darkai.ca/un-default/privacy/

Paste that URL into the store listing **Privacy policy** field.

## 3. Developer Dashboard steps

1. Open https://chrome.google.com/webstore/devconsole (you already paid the $5 fee).
2. Open the **existing** item (**do not** create a new one — that splits users and loses the store URL).
3. Upload a new package: `un-default-extension.zip`.
4. Update listing fields from `store/LISTING.md` (name → Un-Default, descriptions, privacy URL).
5. Complete **Privacy practices** (no data collection / preferences only — see LISTING.md).
6. Justify `storage` + content-script host access if asked (copy from LISTING.md).
7. Keep visibility: **Public**.
8. Submit for review.

## 4. Review tips

- Keep the package free of `eval`, remote script tags, and minified mystery bundles.
- Current package is plain JS + local `rules.json`.
- First review often takes a few days; reply promptly if Google asks questions.

## 5. After approval

- Share the store URL on https://darkai.ca/un-default/
- For updates: bump `manifest.json` `version`, run `npm run extension:pack`, upload a new package.

## Edge Add-ons (optional)

You can reuse the same zip at https://partner.microsoft.com/dashboard/microsoftedge/overview after a separate partner registration.
