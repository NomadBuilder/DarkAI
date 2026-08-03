# Decolonize (DarkAI)

Inclusive language review for website copy — colonial defaults, gendered assumptions, ableist metaphors, and more.

**Live:** [https://darkai.ca/decolonize](https://darkai.ca/decolonize)

## In this monorepo

- Static Next.js UI exported to `decolonize/out` with `BASE_PATH=/decolonize`
- Flask blueprint (`blueprint.py`) serves the UI and `/decolonize/api/scrape`
- Language analysis runs in the browser from curated rules in `src/lib/rules.ts`
- CLI for scanning repos: `npm run analyze -- ./src`

## Local UI (standalone)

```bash
cd decolonize
npm install
npm run dev
```

## Build for DarkAI

```bash
cd decolonize
npm install
npm run build:darkai
```

Then run the Flask app from the repo root; open `/decolonize`.

## Tune rules

Open `/decolonize/rules` or edit `src/lib/rules.ts` for shared defaults.
