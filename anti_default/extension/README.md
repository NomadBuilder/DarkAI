# Anti-Default browser extension

Chrome / Edge (Manifest V3) extension that highlights inclusive-language matches on any live page.

## Install (unpacked)

1. From `anti_default/`, run `npm run extension:rules` to refresh `rules.json`.
2. Open `chrome://extensions` (or `edge://extensions`).
3. Enable **Developer mode**.
4. **Load unpacked** → select this `extension/` folder.
5. Visit any public page — matches are underlined; hover for why / suggestions.

Toggle highlights from the extension popup.

Full review workflow (crawl, rewrite, export): [darkai.ca/anti-default](https://darkai.ca/anti-default/).
