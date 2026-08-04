> **Shareable home:** [github.com/NomadBuilder/anti-default](https://github.com/NomadBuilder/anti-default)  
> This folder is the copy vendored into [DarkAI](https://github.com/NomadBuilder/DarkAI) for darkai.ca hosting.

# Anti-Default

**Catch default language before it ships.**

Anti-Default flags colonial defaults, gendered assumptions, ableist metaphors, and widely documented dogwhistles in websites, docs, and code — then offers clearer alternatives you can use right away.

**[Try it live →](https://darkai.ca/anti-default)** · No account · Runs locally from open rules · No AI required for matching

---

## Why teams use it

- **Review copy before publish** — paste text, upload a doc, or scan a page
- **Swap one phrase fast** — `you guys` → `you all` / `folks` / `y’all`
- **Learn coded language** — dogwhistle guide with signal, context, and clearer wording
- **Scan your repo** — CLI over source and docs
- **Tune what matters** — turn rules on/off and export a shareable style guide

Every suggestion cites the style guides and references behind it.

---

## Quick start

```bash
git clone https://github.com/NomadBuilder/anti-default.git
cd anti-default
npm install
```

### Scan your own content

```bash
npm run analyze -- .
npm run analyze -- ./src ./docs ./README.md
```

### Run the app locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — Review, Swap, Dogwhistles, Rules, and Sources.

### Load the browser extension

```bash
npm run extension:pack
```

Chrome / Edge → Developer mode → **Load unpacked** → `extension/`  
Details: [`extension/README.md`](extension/README.md)

---

## What’s included

| | |
| --- | --- |
| **Review** | Paste, upload PDF/DOCX/text, or review a URL. Export Markdown, CSV, or a GitHub checklist. |
| **Swap** | Look up a word or short phrase for inclusive alternatives. |
| **Dogwhistles** | What a phrase can signal, when context matters, and what to say instead. |
| **Rules** | Browse and tune the catalog. Soft heads-ups stay gentle when language is ambiguous. |
| **CLI** | `npm run analyze` over your repo — offline, same rules as the UI. |

---

## Customize

- UI: `/rules`
- Code: `src/lib/rules.ts`
- Background reading: `/sources`

Practice-test the catch list:

```bash
npm run corpus
```

---

## Host your own build

```bash
npm run build
# → static site in out/

# Subpath deploy (e.g. darkai.ca/anti-default)
NODE_ENV=production STATIC_EXPORT=true BASE_PATH=/anti-default npm run build
```

---

## Live site & DarkAI

Production: [darkai.ca/anti-default](https://darkai.ca/anti-default)  
Also vendored in [DarkAI](https://github.com/NomadBuilder/DarkAI) for that deploy.

**This repo** is the home for cloning, CLI use, PRs, and issues.

## License

[MIT](LICENSE)
