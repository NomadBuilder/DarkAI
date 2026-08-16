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
export const LINKEDIN_POST = `We’ve gotten really good at having agents write the product.

We’re still bad at noticing when the language they write quietly decides who belongs.

As creators, we want the work to feel inclusive — not accidentally coded against the people reading it.

Job posts. Onboarding. UI strings. Docs.
They get drafted in seconds now — often faster than anyone reviews the words themselves.

So a README still says master/slave.
A sprint invite calls the sync a pow-wow.
A status update still calls the outage crazy — or the bug crippling.
A brand brief goes looking for its “spirit animal.”
A review still calls someone “bossy” or “shrill,” or tells them to “man up.”

That’s colonial defaults, ableist metaphors, and quiet digs — the stuff that decides who feels welcome in creator and brand copy.

We moved writing upstream into the agent. The language check should move with it.

Un-Default is a neat way to do that. It runs locally, uses public rules (including sexist digs, ableist metaphors, and male-default language), makes no AI calls, needs no account, and plugs directly into agent workflows.

It’s the kind of small guardrail that feels worth having by default — especially when adding it takes about 30 seconds.

If you’re using Claude Code, Copilot, or ChatGPT:

npx -y anti-default init

https://darkai.ca/un-default/for-agents/

Then “done” doesn’t just mean the code compiles.
`;
