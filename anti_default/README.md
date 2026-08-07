# Anti-Default

### One thoughtful-language check for every way you build.

Anti-Default reviews copy, docs, UI strings, and live pages for colonial
defaults, gendered assumptions, ableist metaphors, and documented dogwhistles.
It explains what it noticed and offers clearer alternatives.

No account. No AI required for matching. Open rules you can tune.

<p align="center">
  <a href="https://darkai.ca/anti-default"><strong>Try the web app</strong></a>
  ·
  <a href="https://chromewebstore.google.com/detail/anti-default-%E2%80%94-inclusive/aajdplalleopollfjegljkajkdcihmhc"><strong>Add the Chrome extension</strong></a>
  ·
  <a href="https://github.com/NomadBuilder/anti-default"><strong>Star on GitHub</strong></a>
</p>

---

## Add it in under a minute

```bash
npx anti-default .
```

That is the whole local setup. It prints findings and exits non-zero on clear
hits. Ambiguous or quoted matches stay advisory.

To pin it in a team project:

```bash
npm install --save-dev anti-default
```

Want the complete project setup?

```bash
npx anti-default init
```

`init` adds an ignore file, changed-files GitHub workflow, Cursor skill + MCP
config, and `inclusive-check` / `inclusive-fix` scripts. Existing files are
never overwritten.

### AI-copy habit (definition of done)

```bash
npx anti-default fix .          # safe 1:1 autofixes only
npx anti-default .              # remaining findings
```

Agents should not mark UI/docs work done until hard findings are cleared or
explicitly marked fine in context. Soft/coded hits stay advisory.

```bash
# Preview autofixes without writing
npx anti-default fix . --dry-run

# Intentional language — suppress locally + share structured feedback
npx anti-default feedback --kind fine_in_context \
  --rule guys-generic --match "guys" --context "…snippet…" \
  --note "Quoted lyric" --open-issue
```

### MCP (for Cursor / Claude / any agent host)

```bash
npx anti-default mcp
```

Tools: `anti_default_scan` · `anti_default_fix` · `anti_default_feedback`  
`init` writes `.cursor/mcp.json` when missing.

### Scan the way you work

```bash
# Paths
npx anti-default ./src ./docs README.md

# CI formats
npx anti-default . --format json  -o report.json
npx anti-default . --format sarif -o results.sarif

# Batch URLs — no Review UI
npx anti-default --urls https://example.com https://example.com/about
npx anti-default --urls-file urls.txt --format json

# Only files changed in this branch
npx anti-default . --changed-from origin/main

# Keep existing findings quiet; report only new ones
npx anti-default baseline .
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

Keep inclusive language in the PR loop. This scans only changed files, fails on
clear new findings, and leaves a checklist comment:

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
        with:
          fetch-depth: 0
      - uses: NomadBuilder/anti-default@v1
        with:
          changed-from: ${{ github.event.pull_request.base.sha }}
          format: json
          comment-on-pr: "true"
```

Prefer SARIF for Code Scanning? Set `format: sarif` and `output-file: anti-default.sarif`. Full inputs: [`action.yml`](action.yml).

---

## Agent skill

`npx anti-default init` installs `.cursor/skills/anti-default/SKILL.md` — the
definition-of-done workflow for AI-generated copy: **fix → scan → ask or
feedback → re-scan**.

Source: [`skills/anti-default/SKILL.md`](skills/anti-default/SKILL.md) ·
feedback model: [`feedback/README.md`](feedback/README.md)

---

## Use it as a library

The npm package has no runtime dependencies and exposes the same analyzer used
by the CLI and web app:

```ts
import { analyzeText, LANGUAGE_RULES } from "anti-default";

const result = analyzeText("Welcome, you guys.");
console.log(result.findings);
```

---

## Chrome extension

Same rules as the app — on the page you’re already looking at.

**[Add to Chrome →](https://chromewebstore.google.com/detail/anti-default-%E2%80%94-inclusive/aajdplalleopollfjegljkajkdcihmhc)**

Runs offline from a bundled rule list. No tracking. No AI calls.  
Dev / unpacked: `npm run extension:pack` → Load unpacked → `extension/` · details in [`extension/README.md`](extension/README.md)

## Web app — try, learn, tune

[darkai.ca/anti-default](https://darkai.ca/anti-default)

- **Review** — paste, upload, or scan a URL; export Markdown, CSV, or a checklist
- **Swap** — turn one phrase into clearer alternatives
- **Dogwhistles** — learn what a phrase can signal and when context matters
- **Rules** — tune the open rule catalog for your project

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
