# Anti-Default browser extension

Chrome / Edge (Manifest V3) extension that highlights inclusive-language matches on any live page.

Matching is **local-only** (bundled `rules.json`). No AI calls. No tracking.

## Install (unpacked / testing)

1. From `anti_default/`, run `npm run extension:pack` (refreshes rules + icons).
2. Open `chrome://extensions` → Developer mode → **Load unpacked** → select this `extension/` folder
   (or load the unzipped pack).
3. Visit any page — matches are underlined; hover for why / suggestions.

## Chrome Web Store

See **[store/PUBLISH.md](store/PUBLISH.md)** for the upload checklist and
**[store/LISTING.md](store/LISTING.md)** for copy-paste store text.

Privacy policy (required for the store): https://darkai.ca/anti-default/privacy/

```bash
npm run extension:pack
# → extension/store/anti-default-extension.zip
```

Full review workflow (crawl, rewrite, export): [darkai.ca/anti-default](https://darkai.ca/anti-default/).
