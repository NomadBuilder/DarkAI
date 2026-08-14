"use client";

import Link from "next/link";
import { CopyBlock } from "@/components/CopyBlock";
import {
  AGENTS_URL,
  CLAUDE_PROJECT_INSTRUCTIONS,
  INIT_COMMAND,
  LINKEDIN_POST,
  MCP_CONFIG_JSON,
} from "@/lib/agent-install";

export function AgentsOnePager() {
  return (
    <div className="grid gap-16">
      <section className="grid gap-4 max-w-2xl">
        <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
          Stars don’t change shipped language. One{" "}
          <code className="text-[var(--ink)]">init</code> does — skill, MCP,
          after-edit hooks, and a PR check so Claude keeps checking even when
          nobody is watching.
        </p>
        <CopyBlock label="Run once in your project" text={INIT_COMMAND} language="bash" />
        <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
          That writes Cursor + Claude Code skills, project MCP,{" "}
          <code className="text-[var(--ink)]">CLAUDE.md</code>, Claude/Cursor
          after-edit hooks, ignore file,{" "}
          <code className="text-[var(--ink)]">inclusive-check</code> /{" "}
          <code className="text-[var(--ink)]">inclusive-fix</code> scripts, and
          a GitHub Action workflow. Existing files are never overwritten.
        </p>
      </section>

      <section className="grid gap-4 max-w-2xl">
        <h2
          className="text-2xl text-[var(--ink)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Claude does it without asking
        </h2>
        <p className="text-[var(--ink-soft)] leading-relaxed">
          After <code className="text-[var(--ink)]">init</code>, Claude Code and
          Cursor hooks scan copy right after file edits. Hard findings are
          pushed back into the agent loop — users don’t have to remember a
          command.
        </p>
      </section>

      <section className="grid gap-4">
        <h2
          className="text-2xl text-[var(--ink)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          What “done” means
        </h2>
        <ol className="grid gap-3 max-w-2xl text-[var(--ink-soft)] leading-relaxed list-decimal pl-5">
          <li>
            Safe autofix:{" "}
            <code className="text-[var(--ink)]">npx -y anti-default fix .</code> (or
            MCP <code className="text-[var(--ink)]">un_default_fix</code>)
          </li>
          <li>
            Scan:{" "}
            <code className="text-[var(--ink)]">npx -y anti-default .</code> (or{" "}
            <code className="text-[var(--ink)]">un_default_scan</code>)
          </li>
          <li>
            Rewrite clear hits; ask before touching identity, quotes, legal, or
            community self-description
          </li>
          <li>
            Intentional language →{" "}
            <code className="text-[var(--ink)]">un_default_feedback</code>
          </li>
          <li>Re-scan until hard findings are gone or marked fine</li>
        </ol>
      </section>

      <section className="grid gap-6">
        <div className="grid gap-2 max-w-2xl">
          <h2
            className="text-2xl text-[var(--ink)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Paste MCP config
          </h2>
          <p className="text-[var(--ink-soft)] leading-relaxed">
            Same JSON for Cursor project MCP, Claude Desktop, and Claude Code
            project scope. Merge under{" "}
            <code className="text-[var(--ink)]">mcpServers</code> if the file
            already has other servers.
          </p>
        </div>

        <CopyBlock
          label=".cursor/mcp.json · .mcp.json · Claude Desktop"
          text={MCP_CONFIG_JSON}
          language="json"
        />

        <div className="grid gap-4 max-w-2xl text-sm text-[var(--ink-soft)] leading-relaxed">
          <p>
            <strong className="font-medium text-[var(--ink)]">Cursor:</strong>{" "}
            project file <code className="text-[var(--ink)]">.cursor/mcp.json</code>{" "}
            (created by <code className="text-[var(--ink)]">init</code>), or
            Cursor Settings → MCP. Reload the window after adding.
          </p>
          <p>
            <strong className="font-medium text-[var(--ink)]">
              Claude Desktop:
            </strong>{" "}
            Settings → Developer → Edit Config → merge into{" "}
            <code className="text-[var(--ink)]">claude_desktop_config.json</code>
            , then fully quit and relaunch. Tools:{" "}
            <code className="text-[var(--ink)]">un_default_scan</code>,{" "}
            <code className="text-[var(--ink)]">un_default_fix</code>,{" "}
            <code className="text-[var(--ink)]">un_default_feedback</code>.
          </p>
          <p>
            <strong className="font-medium text-[var(--ink)]">
              Claude Code:
            </strong>{" "}
            <code className="text-[var(--ink)]">init</code> writes{" "}
            <code className="text-[var(--ink)]">.mcp.json</code> at the repo root
            (project scope). Approve when prompted, or{" "}
            <code className="text-[var(--ink)]">
              claude mcp add --scope project -- npx -y un-default mcp
            </code>
            .
          </p>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="grid gap-2 max-w-2xl">
          <h2
            className="text-2xl text-[var(--ink)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Claude Project instructions
          </h2>
          <p className="text-[var(--ink-soft)] leading-relaxed">
            Paste into Project → Custom instructions so Claude won’t mark UI
            copy done until Un-Default is clean.
          </p>
        </div>
        <CopyBlock
          label="Claude Project · custom instructions"
          text={CLAUDE_PROJECT_INSTRUCTIONS}
          language="text"
        />
      </section>

      <section className="grid gap-4">
        <div className="grid gap-2 max-w-2xl">
          <h2
            className="text-2xl text-[var(--ink)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Share on LinkedIn
          </h2>
          <p className="text-[var(--ink-soft)] leading-relaxed">
            Copy, post, point the CTA at{" "}
            <code className="text-[var(--ink)]">init</code> — not just a star.
          </p>
        </div>
        <CopyBlock label="LinkedIn draft" text={LINKEDIN_POST} language="text" />
        <p className="text-sm text-[var(--ink-soft)]">
          Canonical URL for this page:{" "}
          <a
            href={AGENTS_URL}
            className="text-[var(--teal-deep)] underline underline-offset-2"
          >
            {AGENTS_URL}
          </a>
        </p>
      </section>

      <section className="grid gap-3 max-w-2xl">
        <h2
          className="text-2xl text-[var(--ink)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Also useful
        </h2>
        <ul className="grid gap-2 text-[var(--ink-soft)] leading-relaxed list-disc pl-5">
          <li>
            Tune rules in the{" "}
            <Link
              href="/rules"
              className="text-[var(--teal-deep)] underline underline-offset-2"
            >
              Review UI
            </Link>{" "}
            before you bake habits into agents
          </li>
          <li>
            Team handbook from tuned prefs →{" "}
            <Link
              href="/guide"
              className="text-[var(--teal-deep)] underline underline-offset-2"
            >
              Style guide
            </Link>
          </li>
          <li>
            Marketplace / directory listing checklist in the repo:{" "}
            <code className="text-[var(--ink)]">docs/PUBLISH-DIRECTORIES.md</code>
          </li>
        </ul>
      </section>
    </div>
  );
}
