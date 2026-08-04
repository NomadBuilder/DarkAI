# Anti-Default

Inclusive language review for websites, docs, and code — colonial defaults, gendered assumptions, ableist metaphors, and a careful set of documented dogwhistles.

**Live:** [https://darkai.ca/anti-default](https://darkai.ca/anti-default)  
**Shareable repo:** [github.com/NomadBuilder/anti-default](https://github.com/NomadBuilder/anti-default) ← clone this to run CLI / local UI against your own content

This folder is the copy vendored into the [DarkAI](https://github.com/NomadBuilder/DarkAI) monorepo for production hosting. Prefer opening issues and PRs on **anti-default** unless the change is deploy-only (Flask blueprint, Render build).

## In this monorepo

- Static Next.js UI exported to `anti_default/out` with `BASE_PATH=/anti-default`
- Flask blueprint (`blueprint.py`) serves the UI and `/anti-default/api/scrape`
- Language analysis runs in the browser from curated rules in `src/lib/rules.ts`
- CLI for scanning repos: `npm run analyze -- ./src`

## Local UI

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

```bash
npm run corpus
```

## Deploy note

Render must rebuild `anti_default/out` every deploy (`rm -rf .next out` then `BASE_PATH=/anti-default npm run build`). Dashboard build commands often ignore `render.yaml` — copy from `RENDER_BUILD_COMMAND.txt` (or `_SIMPLE` / `_APPEND`) at the repo root. The build **fails** unless `out/index.html`, `out/swap/index.html`, and `out/dogwhistles/index.html` all exist.

## Browser extension

See the standalone repo’s [`extension/README.md`](https://github.com/NomadBuilder/anti-default/blob/main/extension/README.md), or load `anti_default/extension` unpacked after `npm run extension:pack`.
