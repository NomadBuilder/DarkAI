# Changelog

## Unreleased

- Serve Un-Default OG images with public cache headers (LinkedIn often skips
  `no-cache` assets) and prefer JPEG `og:image` with a version query so
  scrapers re-fetch.
- Remove the Share on LinkedIn block from `/for-agents` (draft stays in
  `docs/agents/LINKEDIN_POST.txt` for offline use).
- Add Open Graph / LinkedIn preview images (`og.png`, `og-for-agents.png`) so
  shared links show the Un-Default mark instead of an empty card.
- Gender pack: high-signal **sexist digs / misogynistic framing** rules
  (e.g. feminazi, like a girl, man up, bossy, shrill, hysterical, unnecessary
  “female [role]”, girls-for-adult-coworkers) so women-creators positioning is
  backed by real checks — mix of hard flags and soft heads-ups.
- Refresh LinkedIn / for-agents social draft around agent-written copy and
  belonging language (master/slave, pow-wow, ableist metaphors, spirit animal,
  sexist digs) — never lead with weak “guys / whitelist” examples on the site.

## 0.5.4

- Claude Code **plugin + marketplace** (`.claude-plugin/`) so users can
  `claude plugin marketplace add NomadBuilder/anti-default` then install
  `un-default@un-default`.
- Official MCP Registry metadata (`server.json` + `mcpName`) and Smithery
  `smithery.yaml` for directory discovery.
- Plugin-bundled `.mcp.json` + `hooks/hooks.json`; for-agents page documents
  the marketplace install path.
- Release automation: `npm run preflight` + tag workflow publishes npm and the
  MCP Registry; manual directory URLs printed at the end.

## 0.5.3

- `init` installs Claude Code + Cursor **after-edit hooks** so agents get Un-Default findings without the user remembering a command.
- Writes `CLAUDE.md` project instructions when missing; strengthens the skill for auto-invocation.

## 0.5.2

- Fix GitHub Action path in `init` workflow template to `NomadBuilder/anti-default@v1` (repo was never renamed).
- Align remaining docs/privacy copy with the published npm package name.

## 0.5.1

- Publish on npm as **`anti-default@0.5.1`** (product brand Un-Default). The name `un-default` is blocked on the registry as too similar to unrelated package `undefault`.
- Ship `/for-agents` one-pager: after Claude writes UI copy, run `npx -y anti-default init`.
- Paste-ready MCP config for Cursor, Claude Desktop, and Claude Code; Claude Project instructions; LinkedIn draft.
- `init` also writes `.claude/skills/un-default/SKILL.md` and project `.mcp.json`.
- Cursor plugin manifest (`.cursor-plugin/plugin.json`) + directory publish checklist.

## 0.5.0

- Rename the product from **Anti-Default** to **Un-Default** (undoing defaults, not opposing people).
- Web path moves to `/un-default`; `/anti-default` redirects permanently.
- CLI package and command are `un-default`; `anti-default` remains a bin alias.
- Browser storage and `.antidefaultignore` / baseline files still migrate or fall back.

## 0.4.0

- Add `un-default fix` for safe unambiguous autofixes (habit, not debate).
- Add MCP server (`un-default mcp`) with scan / fix / feedback tools for agents.
- Add `un-default feedback` and web **Fine in this context** to improve the shared catalog.
- Upgrade the Cursor skill to an AI-copy definition-of-done workflow.
- `init` now installs MCP config and `inclusive-fix` script.

## 0.3.0

- Publish a compiled, zero-runtime-dependency CLI and programmatic API.
- Add `un-default init` for repo workflow, ignore file, package script, and Cursor skill.
- Add changed-files scanning with `--changed-from`.
- Add committed finding baselines with `un-default baseline`.
- Make the GitHub Action run the compiled artifact without installing the web app.
- Scan Markdown and plain-text documents as prose.

## 0.2.0

- Add text, JSON, and SARIF CLI output.
- Add folder and URL-list scanning.
- Add `.undefaultignore` path and rule controls.
