# Anti-Default (DarkAI)

Inclusive language review for website copy — colonial defaults, gendered assumptions, ableist metaphors, and more.

**Live:** [https://darkai.ca/anti-default](https://darkai.ca/anti-default)

## In this monorepo

- Static Next.js UI exported to `anti_default/out` with `BASE_PATH=/anti-default`
- Flask blueprint (`blueprint.py`) serves the UI and `/anti-default/api/scrape`
- Language analysis runs in the browser from curated rules in `src/lib/rules.ts`
- CLI for scanning repos: `npm run analyze -- ./src`

## Local UI (standalone)

```bash
cd anti_default
npm install
npm run dev
```

## Build for DarkAI

```bash
cd anti_default
npm install
npm run build:darkai
```

Then run the Flask app from the repo root; open `/anti-default`.

## Tune rules

Open `/anti-default/rules` or edit `src/lib/rules.ts` for shared defaults.

Practice-test the catch list against real-ish snippets:

```bash
npm run corpus
```

See `fixtures/corpus/README.md`.

## Style guide

Open `/anti-default/guide` to share a team style guide from your tuned rules (copy link or download Markdown).

## Sources

Open `/anti-default/sources` for the style guides and references that informed the rule catalog.

## Review features

- Home **Swap door**: look up one phrase without pasting a page
- Findings deep-link to `/swap/?q=…`
- **Rewrite passage**: apply first suggestions in order (skips soft-flags)
- Context-aware matching (quotes, org names, first-person illness stories, legal/policy) with soft-flags only when still ambiguous
- Multi-page crawl (about / careers / product on the same site)
- Side-by-side document highlights + finding cards
- Plain-language urgency: Worth fixing / Consider / Optional
- Per-rule source footnotes on `/rules`; Swap shows “Supported by: APA / GLAAD / …”
- Report a wrong suggestion → GitHub issue template
- Ignore false positives (“Not this match”)
- Export findings as Markdown, CSV, or a GitHub checklist
- Upload PDF / DOCX / text docs
- Apply a suggestion and preview the rewrite

## Deploy note

Render must rebuild `anti_default/out` every deploy (`rm -rf .next out` then `BASE_PATH=/anti-default npm run build`). Dashboard build commands often ignore `render.yaml` — copy from `RENDER_BUILD_COMMAND.txt` (or `_SIMPLE` / `_APPEND`) at the repo root. The build **fails** unless `out/index.html`, `out/swap/index.html`, and `out/dogwhistles/index.html` all exist.

## Browser extension

Load `anti_default/extension` as an unpacked Chrome/Edge extension to highlight matches on any live page. See `extension/README.md`.

```bash
npm run extension:rules
```
