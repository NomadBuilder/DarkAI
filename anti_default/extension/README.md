# Anti-Default browser extension

Chrome / Edge (Manifest V3) extension that highlights inclusive-language matches on any live page.

Matching is **local-only** (bundled `rules.json`). No AI calls. No tracking.

## Install (unpacked / testing)

1. From the repo root, run `npm run extension:pack` (refreshes rules + icons).
2. Open `chrome://extensions` → Developer mode → **Load unpacked** → select this `extension/` folder
   (or load the unzipped pack).
3. Visit any page — matches are underlined; hover for why / suggestions.

## Chrome Web Store

**Install:** [Anti-Default Inclusive Language](https://chromewebstore.google.com/search/Anti-Default%20Inclusive%20Language)

(Once you have the permanent listing URL from the developer dashboard, replace the search link in `src/lib/links.ts` / `NEXT_PUBLIC_CHROME_STORE_URL`.)

See **[store/PUBLISH.md](store/PUBLISH.md)** for the upload checklist and
**[store/LISTING.md](store/LISTING.md)** for copy-paste store text.

Privacy policy (required for the store): https://darkai.ca/anti-default/privacy/

```bash
npm run extension:pack
# → extension/store/anti-default-extension.zip
```

Full review workflow (crawl, rewrite, export): [darkai.ca/anti-default](https://darkai.ca/anti-default/).
Source: [github.com/NomadBuilder/anti-default](https://github.com/NomadBuilder/anti-default).
