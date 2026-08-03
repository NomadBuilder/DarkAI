"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { analyzeText } from "@/lib/analyzer";
import { withBasePath } from "@/lib/base-path";
import type { AnalysisResult, Category, Finding, Severity } from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";
import { useRulePreferences } from "@/hooks/useRulePreferences";

type Mode = "url" | "text";

const FALLBACK_TEXT =
  "Paste marketing copy, docs, or UI strings here to review inclusive language.";

function severityClass(severity: Severity): string {
  if (severity === "high") return "text-[var(--danger)] bg-[color-mix(in_oklab,var(--danger)_12%,white)]";
  if (severity === "medium") return "text-[var(--warn)] bg-[color-mix(in_oklab,var(--warn)_12%,white)]";
  return "text-[var(--moss-deep)] bg-[color-mix(in_oklab,var(--leaf)_18%,white)]";
}

function categoryAccent(category: Category): string {
  const map: Record<Category, string> = {
    colonial: "var(--moss)",
    gender: "var(--ink-soft)",
    ableist: "var(--warn)",
    racialized: "var(--danger)",
    lgbtq: "var(--moss-deep)",
    class: "var(--ink)",
    age: "var(--leaf)",
    general: "var(--ink-soft)",
  };
  return map[category];
}

export function ReviewApp() {
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("https://example.com");
  const [text, setText] = useState(FALLBACK_TEXT);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Category | "all">("all");
  const [isPending, startTransition] = useTransition();
  const { preferences, drift } = useRulePreferences();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const copyRes = await fetch(withBasePath("/fixtures/demo-copy.txt"));
        if (cancelled || !copyRes.ok) return;
        setText(await copyRes.text());
      } catch {
        // Keep fallback — demo is optional.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function runReview() {
    setError(null);
    startTransition(async () => {
      try {
        if (mode === "text") {
          setResult(
            analyzeText(text, {
              sourceType: "text",
              sourceLabel: "pasted text",
              title: "Text review",
              preferences,
            }),
          );
          setFilter("all");
          return;
        }

        const response = await fetch(withBasePath("/api/scrape"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Could not scrape URL.");
        }

        setResult(
          analyzeText(data.text || "", {
            sourceType: "url",
            sourceLabel: data.url || url,
            title: data.title || "Page review",
            preferences,
          }),
        );
        setFilter("all");
      } catch (err) {
        setResult(null);
        setError(err instanceof Error ? err.message : "Review failed.");
      }
    });
  }

  const findings =
    result?.findings.filter(
      (f) => filter === "all" || f.category === filter,
    ) ?? [];

  return (
    <div className="w-full">
      <div className="animate-rise-delay-2 flex flex-wrap gap-2 mb-5">
        {(
          [
            ["url", "Website URL"],
            ["text", "Paste text"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={`px-4 py-2 text-sm tracking-wide transition-colors ${
              mode === id
                ? "bg-[var(--ink)] text-[var(--paper)]"
                : "bg-white/50 text-[var(--ink-soft)] hover:bg-white/80"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {mode === "url" && (
          <label className="grid gap-2">
            <span className="text-sm text-[var(--ink-soft)]">
              Public page to scrape and review
            </span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://"
              className="w-full bg-white/70 border border-[color-mix(in_oklab,var(--ink)_14%,transparent)] px-4 py-3 text-[var(--ink)] outline-none focus:border-[var(--moss)]"
            />
          </label>
        )}

        {mode === "text" && (
          <label className="grid gap-2">
            <span className="text-sm text-[var(--ink-soft)]">
              Marketing copy, docs, UI strings — paste anything
            </span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              className="w-full resize-y bg-white/70 border border-[color-mix(in_oklab,var(--ink)_14%,transparent)] px-4 py-3 text-[var(--ink)] outline-none focus:border-[var(--moss)] font-[family-name:var(--font-body)]"
            />
          </label>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={runReview}
            disabled={isPending}
            className="btn-primary bg-[var(--moss-deep)] text-[var(--paper)] px-6 py-3 text-sm tracking-wide hover:bg-[var(--ink)] disabled:opacity-60 transition-colors"
          >
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                Reviewing
                <span className="loading-dot">…</span>
              </span>
            ) : (
              "Review language"
            )}
          </button>
          <p className="text-sm text-[var(--ink-soft)] max-w-md">
            Suggestions are starting points — context always wins.{" "}
            <Link
              href="/rules"
              className="text-[var(--moss-deep)] underline underline-offset-2 hover:text-[var(--ink)]"
            >
              View & tune rules
            </Link>
            {drift.disabled > 0 || drift.severityChanged > 0 ? (
              <span className="text-[var(--warn)]">
                {" "}
                ({drift.disabled} off, {drift.severityChanged} retuned)
              </span>
            ) : null}
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="text-[var(--danger)] bg-[color-mix(in_oklab,var(--danger)_10%,white)] px-4 py-3 text-sm"
          >
            {error}
          </p>
        )}
      </div>

      {result && (
        <section className="mt-12 animate-rise" aria-live="polite">
          <header className="mb-6 border-t border-[color-mix(in_oklab,var(--ink)_16%,transparent)] pt-8">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--moss)] mb-2">
              Results
            </p>
            <h2
              className="text-3xl md:text-4xl text-[var(--ink)] mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {result.summary.total === 0
                ? "No rule matches found"
                : `${result.summary.total} phrase${result.summary.total === 1 ? "" : "s"} to reconsider`}
            </h2>
            <p className="text-[var(--ink-soft)]">
              {result.title ? `${result.title} · ` : ""}
              {result.sourceLabel}
            </p>
          </header>

          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-sm text-[var(--ink-soft)]">
            <span>
              High{" "}
              <strong className="text-[var(--danger)] font-medium">
                {result.summary.bySeverity.high ?? 0}
              </strong>
            </span>
            <span>
              Medium{" "}
              <strong className="text-[var(--warn)] font-medium">
                {result.summary.bySeverity.medium ?? 0}
              </strong>
            </span>
            <span>
              Low{" "}
              <strong className="text-[var(--moss)] font-medium">
                {result.summary.bySeverity.low ?? 0}
              </strong>
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            <FilterChip
              active={filter === "all"}
              onClick={() => setFilter("all")}
              label={`All (${result.summary.total})`}
            />
            {(
              Object.entries(result.summary.byCategory) as Array<
                [Category, number]
              >
            ).map(([category, count]) => (
              <FilterChip
                key={category}
                active={filter === category}
                onClick={() => setFilter(category)}
                label={`${CATEGORY_META[category].title} (${count})`}
                accent={categoryAccent(category)}
              />
            ))}
          </div>

          {findings.length === 0 ? (
            <p className="text-[var(--ink-soft)]">
              Nothing in this filter. Rules catch common patterns — they are not
              a substitute for community review.
            </p>
          ) : (
            <ul className="grid gap-5">
              {findings.map((finding) => (
                <FindingRow key={finding.id} finding={finding} />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  accent,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  accent?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs px-3 py-1.5 border transition-colors ${
        active
          ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]"
          : "bg-transparent text-[var(--ink-soft)] border-[color-mix(in_oklab,var(--ink)_18%,transparent)] hover:border-[var(--ink-soft)]"
      }`}
      style={
        !active && accent
          ? { borderLeftColor: accent, borderLeftWidth: 3 }
          : undefined
      }
    >
      {label}
    </button>
  );
}

function FindingRow({ finding }: { finding: Finding }) {
  return (
    <li className="grid gap-3 md:grid-cols-[7rem_1fr] border-b border-[color-mix(in_oklab,var(--ink)_10%,transparent)] pb-5">
      <div className="pt-1">
        <span
          className={`inline-block text-[0.7rem] uppercase tracking-wider px-2 py-1 ${severityClass(finding.severity)}`}
        >
          {finding.severity}
        </span>
      </div>
      <div className="grid gap-2">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3
            className="text-xl text-[var(--ink)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {finding.label}
          </h3>
          <span className="text-xs uppercase tracking-wider text-[var(--moss)]">
            {CATEGORY_META[finding.category].title}
          </span>
        </div>
        <p className="font-[family-name:var(--font-mono)] text-sm text-[var(--ink)]">
          “{finding.match}”
          {finding.source ? (
            <span className="text-[var(--ink-soft)]"> · {finding.source}</span>
          ) : null}
        </p>
        <p className="text-[var(--ink-soft)] text-[0.95rem] leading-relaxed max-w-3xl">
          {finding.why}
        </p>
        <p className="text-sm text-[var(--moss-deep)]">
          <span className="text-[var(--ink-soft)]">Try: </span>
          {finding.suggestions.join(" · ")}
        </p>
        <p className="text-sm text-[var(--ink-soft)]/90 bg-white/40 px-3 py-2 leading-relaxed">
          {finding.context}
        </p>
      </div>
    </li>
  );
}
