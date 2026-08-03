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

## Style guide

Open `/anti-default/guide` to share a team style guide from your tuned rules (copy link or download Markdown).

## Review features

- Ignore false positives (“Not this match”)
- Export findings as Markdown, CSV, or a GitHub checklist
- Upload PDF / DOCX / text docs
- Apply a suggestion and preview the rewrite
