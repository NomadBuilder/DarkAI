---
name: un-default
description: Definition-of-done for AI-written user-facing copy. Always use after writing or editing UI text, docs, READMEs, marketing, onboarding, job posts, emails, or any public language; before marking a task complete; when reviewing a PR for inclusive wording. If Un-Default hooks report findings after an edit, fix them before continuing.
---

# Un-Default — AI copy definition of done

You are not done with user-facing language until Un-Default is clean of hard findings (or remaining hits are intentional and recorded).

Hooks may already scan files after Edit/Write — treat those findings as blockers for finishing copy work.

## Required workflow

1. **Safe auto-heal**
   ```bash
   npx -y anti-default fix . --dry-run
   npx -y anti-default fix .
   ```
   Only unambiguous 1:1 swaps are applied (e.g. `policeman` → `police officer`, `whitelist` → `allowlist`). Soft/coded/contextual hits are never auto-changed.

2. **Scan**
   ```bash
   npx -y anti-default . --format json --fail-on never
   ```
   Or via MCP tools: `un_default_fix` then `un_default_scan`.

3. **Act on remaining findings**
   - Clear, unambiguous user-facing hits → rewrite yourself using the suggestions.
   - Identity, quoted, historical, legal, illness-story, or community self-description → explain and **ask** before changing.
   - Intentional / appropriate in context → record feedback (do not silently ignore forever without a trail):
     ```bash
     npx -y anti-default feedback --kind fine_in_context \
       --rule <ruleId> --match "<text>" --context "<snippet>" \
       --note "<why it was fine>" --open-issue
     ```
     Or MCP `un_default_feedback`.

4. **Re-scan** until hard findings are gone or explicitly marked fine in context.

5. **Report** what was autofixed, what you rewrote, what you asked about, and what remains.

## Hard rules for agents

- Do **not** rewrite APIs, identifiers, package names, proper names, or quotations without confirmation.
- Do **not** “fix” coded/dogwhistle hits automatically — they are heads-ups; context wins.
- Prefer `fix` before manual edits so safe cases become habit, not debate.
- If MCP is configured, prefer MCP tools over shelling out.
- If a hook surfaces Un-Default findings, address them before claiming the task is done.

## MCP

```bash
npx -y anti-default mcp
```

Tools: `un_default_scan`, `un_default_fix`, `un_default_feedback`.

## Project files

Respect `.undefaultignore`, `.undefaultbaseline.json`, and `.undefaultfeedback.jsonl`.
