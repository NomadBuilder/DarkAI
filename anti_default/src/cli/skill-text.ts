/** Bundled into `anti-default init` — keep in sync with skills/anti-default/SKILL.md */
export const SKILL = `---
name: anti-default
description: Makes Anti-Default the definition-of-done check for AI-generated and human user-facing copy. Use after writing or editing UI text, docs, READMEs, marketing, onboarding, job posts, or any public language; before marking a task complete; or when reviewing a PR for inclusive wording.
---

# Anti-Default — AI copy definition of done

You are not done with user-facing language until Anti-Default is clean of hard findings (or remaining hits are intentional and recorded).

## Required workflow

1. **Safe auto-heal**
   \`\`\`bash
   npx anti-default fix . --dry-run
   npx anti-default fix .
   \`\`\`
   Only unambiguous 1:1 swaps are applied (e.g. \`policeman\` → \`police officer\`, \`whitelist\` → \`allowlist\`). Soft/coded/contextual hits are never auto-changed.

2. **Scan**
   \`\`\`bash
   npx anti-default . --format json --fail-on never
   \`\`\`
   Or via MCP tools: \`anti_default_fix\` then \`anti_default_scan\`.

3. **Act on remaining findings**
   - Clear, unambiguous user-facing hits → rewrite yourself using the suggestions.
   - Identity, quoted, historical, legal, illness-story, or community self-description → explain and **ask** before changing.
   - Intentional / appropriate in context → record feedback (do not silently ignore forever without a trail):
     \`\`\`bash
     npx anti-default feedback --kind fine_in_context \\
       --rule <ruleId> --match "<text>" --context "<snippet>" \\
       --note "<why it was fine>" --open-issue
     \`\`\`
     Or MCP \`anti_default_feedback\`.

4. **Re-scan** until hard findings are gone or explicitly marked fine in context.

5. **Report** what was autofixed, what you rewrote, what you asked about, and what remains.

## Hard rules for agents

- Do **not** rewrite APIs, identifiers, package names, proper names, or quotations without confirmation.
- Do **not** “fix” coded/dogwhistle hits automatically — they are heads-ups; context wins.
- Prefer \`fix\` before manual edits so safe cases become habit, not debate.
- If MCP is configured, prefer MCP tools over shelling out.

## MCP

\`\`\`bash
npx anti-default mcp
\`\`\`

Tools: \`anti_default_scan\`, \`anti_default_fix\`, \`anti_default_feedback\`.

## Project files

Respect \`.antidefaultignore\`, \`.antidefaultbaseline.json\`, and \`.antidefaultfeedback.jsonl\`.
`;
