# Anti-Default

**Catch default language before it ships.**

Anti-Default flags colonial defaults, gendered assumptions, ableist metaphors, and widely documented dogwhistles in websites, docs, and code — then offers clearer alternatives.

**Default habit:** CLI · GitHub Action · browser extension  
**Tuning surface:** [web app](https://darkai.ca/anti-default) (Review / Swap / Dogwhistles / Rules)

[Live app](https://darkai.ca/anti-default) · [Chrome extension](https://chromewebstore.google.com/search/Anti-Default%20Inclusive%20Language) · [GitHub](https://github.com/NomadBuilder/anti-default)

---

## One-command scan

```bash
npx anti-default .
```

Prints findings and exits **non-zero** when hard hits remain (`--fail-on hard`, default). Soft / ambiguous hits do not fail CI unless you pass `--fail-on any`.

```bash
# Folder or files
npx anti-default ./src ./docs README.md

# Machine output for CI
npx anti-default . --format json -o report.json
npx anti-default . --format sarif -o results.sarif

# Batch URLs (no Review UI)
npx anti-default --urls https://example.com https://example.com/about
npx anti-default --urls-file urls.txt --format json

# Never fail the process (report only)
npx anti-default . --fail-on never
```

Until the package is on the public npm registry, you can also run from a clone:

```bash
git clone https://github.com/NomadBuilder/anti-default.git
cd anti-default && npm install
node bin/anti-default.js .
# or: npx --yes github:NomadBuilder/anti-default
```

### Ignore / baseline

Commit a `.antidefaultignore` (see [`.antidefaultignore.example`](.antidefaultignore.example)):

```
node_modules/
vendor/
*.min.js
rule:guys          # disable a rule id for this repo
```

---

## GitHub Action

Fail PRs and (optionally) post a checklist comment:

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
          format: json          # use json for PR checklist comments
          output-file: anti-default-report.json
          comment-on-pr: "true"
```

SARIF upload: set `format: sarif` and `output-file: anti-default.sarif` (Code Scanning permissions required).

Action inputs: see [`action.yml`](action.yml).

---

## Browser extension

Same rules as the web app, on live pages.

- **Chrome Web Store:** search [Anti-Default Inclusive Language](https://chromewebstore.google.com/search/Anti-Default%20Inclusive%20Language) (or set `NEXT_PUBLIC_CHROME_STORE_URL` to your permanent listing URL)
- **Load unpacked:** `npm run extension:pack` → Chrome / Edge → Developer mode → Load unpacked → `extension/`

Details: [`extension/README.md`](extension/README.md)

---

## Web app (demo + tuning)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — Review, Swap, Dogwhistles, Rules, Sources.

| Surface | Role |
| --- | --- |
| **CLI / Action / Extension** | Day-to-day habit at scale |
| **Review** | Paste, upload, or scan a URL; export Markdown / CSV / checklist |
| **Swap** | One phrase → alternatives |
| **Dogwhistles** | Signal, context, clearer wording |
| **Rules** | Turn patterns on/off; soft heads-ups stay gentle when ambiguous |

---

## Customize

- UI: `/rules`
- Code: `src/lib/rules.ts`
- Sources: `/sources`
- Corpus self-check: `npm run corpus`

---

## Host your own build

```bash
npm run build
# → static site in out/

NODE_ENV=production STATIC_EXPORT=true BASE_PATH=/anti-default npm run build
```

Production: [darkai.ca/anti-default](https://darkai.ca/anti-default) · also vendored in [DarkAI](https://github.com/NomadBuilder/DarkAI).

## License

[MIT](LICENSE)
