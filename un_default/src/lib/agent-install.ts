import { LIVE_APP_URL } from "./links";

/** Primary CTA for the Claude / Cursor growth loop. */
export const INIT_COMMAND = "npx un-default init";

export const AGENTS_PATH = "/for-agents";
export const AGENTS_URL = `${LIVE_APP_URL}${AGENTS_PATH}`;

/** stdio MCP server entry — same blob for Cursor, Claude Desktop, Claude Code. */
export const MCP_SERVER_ENTRY = {
  command: "npx",
  args: ["-y", "un-default", "mcp"],
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

Workflow (every time you write or edit public language):
1. Prefer MCP tools if available: un_default_fix (safe 1:1 only), then un_default_scan.
2. Or run in the project shell:
   npx un-default fix .
   npx un-default . --format json --fail-on never
3. Rewrite clear hits using suggestions. Ask before changing identity, quotes, legal, historical, illness-story, or community self-description.
4. Intentional language → record with un_default_feedback (or npx un-default feedback …) — do not silently ignore forever.
5. Re-scan until hard findings are gone or marked fine in context. Report what you fixed, asked about, and left.

Setup once in this repo: npx un-default init
Docs: ${AGENTS_URL}
`;

/** Short LinkedIn / social paste — keep under ~1300 chars for easy posting. */
export const LINKEDIN_POST = `After Claude (or Cursor) writes UI copy, I don't mark it done until Un-Default is clean.

One command sets the habit for the whole repo — skill + MCP + PR check:

${INIT_COMMAND}

Paste-ready MCP + Claude Project instructions:
${AGENTS_URL}

Local rules. No account. Same check in CI.
`;
