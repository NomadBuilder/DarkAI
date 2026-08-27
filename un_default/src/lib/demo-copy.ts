/** Sample agent-written copy that guarantees findings for demos and `init`. */

export const DEMO_FILE_RELATIVE = "examples/un-default-demo.md";

/** Body only — used by the web Review demo and analyzer. */
export const DEMO_COPY = `Welcome guys! Our gurus discovered a primitive workflow that will blow your minds — it's crazy effective.

Ladies and gentlemen, our native English speakers only team pioneered this in the Third World market. Do a sanity check before we pow-wow with stakeholders.

Pregnant women and the elderly can whitelist features; master/slave databases are grandfathered in.
`;

/** Written by `un-default init` so the next scan has fireworks. */
export function demoFileContents(): string {
  return `# Un-Default sample copy

Agent-written marketing draft so you can verify the install. Safe to delete.

---

${DEMO_COPY.trim()}
`;
}
