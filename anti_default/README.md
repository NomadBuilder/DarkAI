# Anti-Default

### Catch default language before it ships.

Colonial defaults. Gendered assumptions. Ableist metaphors. Documented dogwhistles. Anti-Default flags them in your copy, docs, and code — then offers clearer alternatives you can use right away.

No account. No AI required for matching. Open rules you can tune.

<p align="center">
  <a href="https://darkai.ca/anti-default"><strong>Try the web app</strong></a>
  ·
  <a href="https://chromewebstore.google.com/detail/anti-default-%E2%80%94-inclusive/aajdplalleopollfjegljkajkdcihmhc"><strong>Add the Chrome extension</strong></a>
  ·
  <a href="https://github.com/NomadBuilder/anti-default"><strong>Star on GitHub</strong></a>
</p>

---

## The habit (not the demo)

Vibe-coders and creators maintaining content at scale don’t paste one page into a UI. Make the scan part of how you ship:

| Do this every day | What it is |
| --- | --- |
| `npx anti-default .` | One-command folder scan — prints findings, exits non-zero |
| GitHub Action | Fail the PR · post a fix checklist |
| [Chrome extension](https://chromewebstore.google.com/detail/anti-default-%E2%80%94-inclusive/aajdplalleopollfjegljkajkdcihmhc) | Live highlights on any page you’re editing |

The [web app](https://darkai.ca/anti-default) is for demos, Swap lookups, Dogwhistles learning, and tuning rules — not your default workflow.

---

## One-command scan

```bash
npx anti-default .
```

Findings print to the terminal. Hard hits fail the process by default (`--fail-on hard`). Soft / ambiguous matches stay advisory unless you pass `--fail-on any`.

```bash
# Paths
npx anti-default ./src ./docs README.md

# CI formats
npx anti-default . --format json  -o report.json
npx anti-default . --format sarif -o results.sarif

# Batch URLs — no Review UI
npx anti-default --urls https://example.com https://example.com/about
npx anti-default --urls-file urls.txt --format json
```

Until the package is on the public npm registry:

```bash
npx --yes github:NomadBuilder/anti-default .
# or clone → npm install → node bin/anti-default.js .
```

### Ignore what doesn’t matter

Commit a `.antidefaultignore` so day-two noise doesn’t drown the team ([example](.antidefaultignore.example)):

```
node_modules/
vendor/
*.min.js
rule:guys          # turn off one rule for this repo
```

---

## GitHub Action

Keep inclusive language in the PR loop — fail on hard hits and (optionally) leave a checklist comment:

```yaml
# .github/workflows/anti-default.yml
name: Anti-Default
on: [pull_request]
permissions:
  contents: read
  pull-requests: write
  security-events: write

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: NomadBuilder/anti-default@main
        with:
          paths: "."
          fail-on: hard
          format: json
          output-file: anti-default-report.json
          comment-on-pr: "true"
```

Prefer SARIF for Code Scanning? Set `format: sarif` and `output-file: anti-default.sarif`. Full inputs: [`action.yml`](action.yml).

---

## Chrome extension

Same rules as the app — on the page you’re already looking at.

**[Add to Chrome →](https://chromewebstore.google.com/detail/anti-default-%E2%80%94-inclusive/aajdplalleopollfjegljkajkdcihmhc)**

Runs offline from a bundled rule list. No tracking. No AI calls.  
Dev / unpacked: `npm run extension:pack` → Load unpacked → `extension/` · details in [`extension/README.md`](extension/README.md)

> Store listing may lag local. Packaged build is **0.2.6**. Upload `npm run extension:pack` after testing with Load unpacked.

---

## Web app — try, learn, tune

[darkai.ca/anti-default](https://darkai.ca/anti-default)

| | |
| --- | --- |
| **Review** | Paste, upload, or scan a URL · export Markdown / CSV / checklist |
| **Swap** | One phrase → clearer alternatives |
| **Dogwhistles** | What a phrase can signal, when context matters, what to say instead |
| **Rules** | Turn patterns on/off · soft heads-ups when language is ambiguous |

```bash
npm install && npm run dev   # localhost:3000
```

---

## Why teams reach for it

- **Before publish** — catch defaults in marketing, docs, and product copy  
- **In the PR** — Action + SARIF/JSON so machines and humans both get a signal  
- **On the live page** — extension for writers who never open a terminal  
- **Without a lecture** — suggestions are invitations; context always wins  

Every suggestion cites the style guides and references behind it → [/sources](https://darkai.ca/anti-default/sources)

---

## Customize & self-host

- Tune in the UI: [/rules](https://darkai.ca/anti-default/rules) · edit code: `src/lib/rules.ts`
- Practice corpus: `npm run corpus`
- Static export: `npm run build` → `out/`  
  Subpath (DarkAI): `STATIC_EXPORT=true BASE_PATH=/anti-default npm run build`

Production lives at [darkai.ca/anti-default](https://darkai.ca/anti-default) and is also vendored in [DarkAI](https://github.com/NomadBuilder/DarkAI).

## License

[MIT](LICENSE)
