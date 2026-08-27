"use client";

import { useMemo } from "react";
import Link from "next/link";
import { analyzeText } from "@/lib/analyzer";
import { DEMO_COPY } from "@/lib/demo-copy";
import { CATEGORY_META, type Finding } from "@/lib/types";

const SHOW = 3;

function pickDemoFindings(findings: Finding[]): Finding[] {
  const hard = findings.filter((f) => !f.likelyFalsePositive);
  const pool = hard.length ? hard : findings;
  return pool.slice(0, SHOW);
}

export function AgentsLiveDemo() {
  const { findings, total } = useMemo(() => {
    const result = analyzeText(DEMO_COPY, {
      sourceType: "text",
      sourceLabel: "demo sample",
      title: "Demo review",
    });
    return {
      findings: pickDemoFindings(result.findings),
      total: result.findings.length,
    };
  }, []);

  return (
    <section className="grid gap-5 max-w-2xl" aria-label="Live demo findings">
      <div className="grid gap-2">
        <h2
          className="text-2xl text-[var(--ink)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          What it catches
        </h2>
        <p className="text-[var(--ink-soft)] leading-relaxed">
          Same local rules that run after{" "}
          <code className="text-[var(--ink)]">init</code> — no account, no model
          call. Sample agent-written copy, analyzed in your browser.
        </p>
      </div>

      <p
        className="text-xs uppercase tracking-[0.16em] text-[var(--moss)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {total} finding{total === 1 ? "" : "s"} · showing {findings.length}
      </p>

      <ul className="grid gap-5">
        {findings.map((finding) => {
          const trySwap = finding.swaps?.[0] ?? finding.suggestions[0];
          return (
            <li
              key={finding.id}
              className="grid gap-2 border-b border-[color-mix(in_oklab,var(--ink)_10%,transparent)] pb-5"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span
                  className="text-[var(--ink)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  “{finding.match}”
                </span>
                <span className="text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                  {CATEGORY_META[finding.category]?.title ?? finding.category}
                </span>
              </div>
              <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
                {finding.why}
              </p>
              {trySwap ? (
                <p className="text-sm text-[var(--ink)] leading-relaxed">
                  Try: {trySwap}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="text-sm text-[var(--ink-soft)] leading-relaxed">
        <Link
          href="/?demo=1"
          className="text-[var(--teal-deep)] underline underline-offset-2 hover:text-[var(--ink)]"
        >
          Open full demo review
        </Link>
        {" · "}
        shareable as <code className="text-[var(--ink)]">?demo=1</code>
      </p>
    </section>
  );
}
