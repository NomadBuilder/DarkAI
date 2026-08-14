# Changelog

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
