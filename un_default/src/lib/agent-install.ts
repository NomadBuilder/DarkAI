import { LIVE_APP_URL } from "./links";

/**
 * npm package name is `anti-default` — `un-default` is blocked on the registry
 * (too similar to unrelated package `undefault`). Product brand remains Un-Default;
 * both CLI bin names ship on this package.
 */
export const NPM_PACKAGE = "anti-default";

/** Primary CTA for the Claude / Cursor growth loop. */
export const INIT_COMMAND = `npx -y ${NPM_PACKAGE} init`;

export const AGENTS_PATH = "/for-agents";
export const AGENTS_URL = `${LIVE_APP_URL}${AGENTS_PATH}`;

/** Claude Code — add this marketplace, then install the plugin (no init required). */
export const CLAUDE_MARKETPLACE_ADD = "claude plugin marketplace add NomadBuilder/anti-default";
export const CLAUDE_PLUGIN_INSTALL =
  "claude plugin install un-default@un-default";

/** stdio MCP server entry — same blob for Cursor, Claude Desktop, Claude Code. */
export const MCP_SERVER_ENTRY = {
  command: "npx",
  args: ["-y", NPM_PACKAGE, "mcp"],
} as const;

export const MCP_CONFIG = {
  mcpServers: {
    "un-default": MCP_SERVER_ENTRY,
  },
} as const;

export const MCP_CONFIG_JSON = `${JSON.stringify(MCP_CONFIG, null, 2)}\n`;

/**
 * Paste into a Claude Project → Custom instructions
 * (or any host that supports a standing project prompt).
 */
export const CLAUDE_PROJECT_INSTRUCTIONS = `You are not done with user-facing copy (UI strings, docs, READMEs, marketing, onboarding, job posts) until Un-Default is clean of hard findings — or remaining hits are intentional and recorded.

This repo may include Claude/Cursor hooks that scan after file edits. Treat hook findings as blockers for finishing copy work.

Workflow (every time you write or edit public language):
1. Prefer MCP tools if available: un_default_fix (safe 1:1 only), then un_default_scan.
2. Or run in the project shell:
   npx -y anti-default fix .
   npx -y anti-default . --format json --fail-on never
3. Rewrite clear hits using suggestions. Ask before changing identity, quotes, legal, historical, illness-story, or community self-description.
4. Intentional language → record with un_default_feedback (or npx -y anti-default feedback …) — do not silently ignore forever.
5. Re-scan until hard findings are gone or marked fine in context. Report what you fixed, asked about, and left.

Setup once in this repo: npx -y anti-default init
Docs: ${AGENTS_URL}
`;

/** Short LinkedIn / social paste — keep under ~1300 chars for easy posting. */
export const LINKEDIN_POST = `Your coding agent just shipped UI copy.

It also quietly left you with “guys,” “whitelist,” and “native English speakers only.”

That’s the gap: agents finish the code, and nobody finishes the language.

Un-Default closes it.

What it is:
A local inclusive-language check that becomes definition-of-done for AI-written copy. Colonial defaults, gendered titles, ableist framing, soft dogwhistles — flagged with plain-language rewrites.

What it is not:
Another account. Another model bill. Another “please remember to review.”

One command installs the habit for the whole repo — skill, MCP, after-edit hooks, PR check — so Claude Code (or Copilot / ChatGPT / whoever) keeps scanning even when you don’t.

npx -y anti-default init

Claude Code, one more step:
claude plugin marketplace add NomadBuilder/anti-default
claude plugin install un-default@un-default

Paste configs + Project instructions:
https://darkai.ca/un-default/for-agents/

If AI writes your words, this is the missing “done.”
`;
