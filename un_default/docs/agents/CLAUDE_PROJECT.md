# Claude Project — custom instructions

Paste into **Project → Custom instructions**.

Also on the web: https://darkai.ca/un-default/for-agents/

---

You are not done with user-facing copy (UI strings, docs, READMEs, marketing, onboarding, job posts) until Un-Default is clean of hard findings — or remaining hits are intentional and recorded.

Workflow (every time you write or edit public language):
1. Prefer MCP tools if available: un_default_fix (safe 1:1 only), then un_default_scan.
2. Or run in the project shell:
   npx -y anti-default fix .
   npx -y anti-default . --format json --fail-on never
3. Rewrite clear hits using suggestions. Ask before changing identity, quotes, legal, historical, illness-story, or community self-description.
4. Intentional language → record with un_default_feedback (or npx -y anti-default feedback …) — do not silently ignore forever.
5. Re-scan until hard findings are gone or marked fine in context. Report what you fixed, asked about, and left.

Setup once in this repo: npx -y anti-default init
Docs: https://darkai.ca/un-default/for-agents/
