"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { analyzeText } from "@/lib/analyzer";
import { withBasePath } from "@/lib/base-path";
import { downloadFindingsExport } from "@/lib/export";
import {
  filterIgnoredFindings,
  ignoreKey,
  loadIgnoredKeys,
  saveIgnoredKeys,
} from "@/lib/ignores";
import { applySuggestionToText, previewRewrite } from "@/lib/rewrite";
import type { AnalysisResult, Category, Finding, Severity } from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";
import { useRulePreferences } from "@/hooks/useRulePreferences";

type Mode = "url" | "text" | "docs";

const FALLBACK_TEXT =
  "Paste marketing copy, docs, or UI strings here to review inclusive language.";

const TEXT_EXTS = new Set([
  "txt",
  "md",
  "markdown",
  "csv",
  "json",
  "html",
  "htm",
  "rtf",
]);

function severityClass(severity: Severity): string {
  if (severity === "high")
    return "text-[var(--danger)] bg-[color-mix(in_oklab,var(--danger)_12%,white)]";
  if (severity === "medium")
    return "text-[var(--warn)] bg-[color-mix(in_oklab,var(--warn)_12%,white)]";
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
  const [docLabel, setDocLabel] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Category | "all">("all");
  const [ignoredKeys, setIgnoredKeys] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const { preferences, drift } = useRulePreferences();

  useEffect(() => {
    setIgnoredKeys(loadIgnoredKeys());
  }, []);

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

  const persistIgnore = useCallback((keys: string[]) => {
    setIgnoredKeys(keys);
    saveIgnoredKeys(keys);
  }, []);

  const ignoreFinding = useCallback(
    (finding: Finding) => {
      const key = ignoreKey(finding);
      if (ignoredKeys.includes(key)) return;
      persistIgnore([...ignoredKeys, key]);
    },
    [ignoredKeys, persistIgnore],
  );

  const clearIgnores = useCallback(() => {
    persistIgnore([]);
  }, [persistIgnore]);

  function analyzeSource(
    sourceText: string,
    options: {
      sourceType: AnalysisResult["sourceType"];
      sourceLabel: string;
      title?: string;
    },
  ) {
    setResult(
      analyzeText(sourceText, {
        ...options,
        preferences,
      }),
    );
    setFilter("all");
  }

  function runReview() {
    setError(null);
    startTransition(async () => {
      try {
        if (mode === "text" || mode === "docs") {
          if (!text.trim()) {
            throw new Error("Add some text or upload a document first.");
          }
          analyzeSource(text, {
            sourceType: mode === "docs" ? "document" : "text",
            sourceLabel: docLabel ?? (mode === "docs" ? "uploaded document" : "pasted text"),
            title: mode === "docs" ? "Document review" : "Text review",
          });
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

        const scraped = data.text || "";
        setText(scraped);
        setDocLabel(null);
        analyzeSource(scraped, {
          sourceType: "url",
          sourceLabel: data.url || url,
          title: data.title || "Page review",
        });
      } catch (err) {
        setResult(null);
        setError(err instanceof Error ? err.message : "Review failed.");
      }
    });
  }

  async function onDocumentSelected(file: File | null) {
    if (!file) return;
    setError(null);
    setDocLabel(file.name);
    setMode("docs");

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";

    startTransition(async () => {
      try {
        if (TEXT_EXTS.has(ext) || file.type.startsWith("text/")) {
          const content = await file.text();
          setText(content);
          return;
        }

        if (ext === "pdf" || ext === "docx" || ext === "doc") {
          const form = new FormData();
          form.append("file", file);
          const response = await fetch(withBasePath("/api/extract"), {
            method: "POST",
            body: form,
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || "Could not extract document text.");
          }
          setText(data.text || "");
          return;
        }

        throw new Error(
          "Supported uploads: PDF, DOCX, TXT, MD, CSV, HTML, JSON.",
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      }
    });
  }

  function applyRewrite(finding: Finding, suggestion: string) {
    const next = applySuggestionToText(text, finding, suggestion);
    setText(next);
    setMode((m) => (m === "url" ? "text" : m));
    analyzeSource(next, {
      sourceType: result?.sourceType === "document" ? "document" : "text",
      sourceLabel: docLabel ?? result?.sourceLabel ?? "edited text",
      title: "Rewrite preview applied",
    });
  }

  const visibleAll = useMemo(() => {
    if (!result) return [];
    return filterIgnoredFindings(result.findings, ignoredKeys);
  }, [result, ignoredKeys]);

  const findings = useMemo(
    () =>
      visibleAll.filter((f) => filter === "all" || f.category === filter),
    [visibleAll, filter],
  );

  const ignoredInResult = result
    ? result.findings.length - visibleAll.length
    : 0;

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<Category, number>> = {};
    for (const f of visibleAll) {
      counts[f.category] = (counts[f.category] ?? 0) + 1;
    }
    return counts;
  }, [visibleAll]);

  const severityCounts = useMemo(() => {
    const counts: Partial<Record<Severity, number>> = {};
    for (const f of visibleAll) {
      counts[f.severity] = (counts[f.severity] ?? 0) + 1;
    }
    return counts;
  }, [visibleAll]);

  return (
    <div className="w-full">
      <div className="animate-rise-delay-2 flex flex-wrap gap-2 mb-5">
        {(
          [
            ["url", "Website URL"],
            ["text", "Paste text"],
            ["docs", "PDF / docs"],
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
              onChange={(e) => {
                setText(e.target.value);
                setDocLabel(null);
              }}
              rows={8}
              className="w-full resize-y bg-white/70 border border-[color-mix(in_oklab,var(--ink)_14%,transparent)] px-4 py-3 text-[var(--ink)] outline-none focus:border-[var(--moss)] font-[family-name:var(--font-body)]"
            />
          </label>
        )}

        {mode === "docs" && (
          <div className="grid gap-3">
            <label className="grid gap-2">
              <span className="text-sm text-[var(--ink-soft)]">
                Upload a brand deck, style guide, or doc (PDF, DOCX, TXT, MD…)
              </span>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md,.markdown,.csv,.html,.htm,.json"
                onChange={(e) =>
                  onDocumentSelected(e.target.files?.[0] ?? null)
                }
                className="w-full bg-white/70 border border-[color-mix(in_oklab,var(--ink)_14%,transparent)] px-4 py-3 text-sm file:mr-3 file:border-0 file:bg-[var(--mist)] file:px-3 file:py-1.5"
              />
            </label>
            {docLabel ? (
              <p className="text-sm text-[var(--moss-deep)]">
                Loaded: {docLabel}
              </p>
            ) : null}
            <label className="grid gap-2">
              <span className="text-sm text-[var(--ink-soft)]">
                Extracted text (editable before review)
              </span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                className="w-full resize-y bg-white/70 border border-[color-mix(in_oklab,var(--ink)_14%,transparent)] px-4 py-3 text-[var(--ink)] outline-none focus:border-[var(--moss)] font-[family-name:var(--font-body)]"
              />
            </label>
          </div>
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
              Tune rules
            </Link>
            {" · "}
            <Link
              href="/guide"
              className="text-[var(--moss-deep)] underline underline-offset-2 hover:text-[var(--ink)]"
            >
              Style guide
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
              {visibleAll.length === 0
                ? ignoredInResult > 0
                  ? "All matches ignored"
                  : "No rule matches found"
                : `${visibleAll.length} phrase${visibleAll.length === 1 ? "" : "s"} to reconsider`}
            </h2>
            <p className="text-[var(--ink-soft)]">
              {result.title ? `${result.title} · ` : ""}
              {result.sourceLabel}
              {ignoredInResult > 0 ? (
                <span>
                  {" "}
                  · {ignoredInResult} ignored{" "}
                  <button
                    type="button"
                    onClick={clearIgnores}
                    className="underline underline-offset-2 text-[var(--moss-deep)]"
                  >
                    clear ignores
                  </button>
                </span>
              ) : null}
            </p>
          </header>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--ink-soft)]">
              <span>
                High{" "}
                <strong className="text-[var(--danger)] font-medium">
                  {severityCounts.high ?? 0}
                </strong>
              </span>
              <span>
                Medium{" "}
                <strong className="text-[var(--warn)] font-medium">
                  {severityCounts.medium ?? 0}
                </strong>
              </span>
              <span>
                Low{" "}
                <strong className="text-[var(--moss)] font-medium">
                  {severityCounts.low ?? 0}
                </strong>
              </span>
            </div>
            <div className="flex flex-wrap gap-2 ml-auto">
              <ExportButton
                label="Markdown"
                onClick={() =>
                  result &&
                  downloadFindingsExport("markdown", result, findings)
                }
              />
              <ExportButton
                label="CSV"
                onClick={() =>
                  result && downloadFindingsExport("csv", result, findings)
                }
              />
              <ExportButton
                label="GitHub checklist"
                onClick={() =>
                  result &&
                  downloadFindingsExport("github", result, findings)
                }
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            <FilterChip
              active={filter === "all"}
              onClick={() => setFilter("all")}
              label={`All (${visibleAll.length})`}
            />
            {(Object.entries(categoryCounts) as Array<[Category, number]>).map(
              ([category, count]) => (
                <FilterChip
                  key={category}
                  active={filter === category}
                  onClick={() => setFilter(category)}
                  label={`${CATEGORY_META[category].title} (${count})`}
                  accent={categoryAccent(category)}
                />
              ),
            )}
          </div>

          {findings.length === 0 ? (
            <p className="text-[var(--ink-soft)]">
              Nothing in this filter. Ignored matches stay quiet until you clear
              them.
            </p>
          ) : (
            <ul className="grid gap-5">
              {findings.map((finding) => (
                <FindingRow
                  key={finding.id}
                  finding={finding}
                  onIgnore={() => ignoreFinding(finding)}
                  onApply={(suggestion) => applyRewrite(finding, suggestion)}
                  canApplyToSource={Boolean(text)}
                />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function ExportButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs px-3 py-1.5 border border-[color-mix(in_oklab,var(--ink)_18%,transparent)] text-[var(--ink-soft)] hover:border-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
    >
      Export {label}
    </button>
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

function FindingRow({
  finding,
  onIgnore,
  onApply,
  canApplyToSource,
}: {
  finding: Finding;
  onIgnore: () => void;
  onApply: (suggestion: string) => void;
  canApplyToSource: boolean;
}) {
  const [chosen, setChosen] = useState(finding.suggestions[0] ?? "");
  const preview = chosen ? previewRewrite(finding, chosen) : null;

  return (
    <li className="grid gap-3 md:grid-cols-[7rem_1fr] border-b border-[color-mix(in_oklab,var(--ink)_10%,transparent)] pb-5">
      <div className="pt-1">
        <span
          className={`inline-block text-[0.7rem] uppercase tracking-wider px-2 py-1 ${severityClass(finding.severity)}`}
        >
          {finding.severity}
        </span>
      </div>
      <div className="grid gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
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
          <button
            type="button"
            onClick={onIgnore}
            className="text-xs text-[var(--ink-soft)] underline underline-offset-2 hover:text-[var(--ink)]"
          >
            Not this match
          </button>
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

        {finding.suggestions.length > 0 ? (
          <div className="grid gap-2 max-w-3xl">
            <label className="text-xs uppercase tracking-wider text-[var(--moss)]">
              Rewrite preview
              <select
                value={chosen}
                onChange={(e) => setChosen(e.target.value)}
                className="mt-1 block w-full normal-case tracking-normal text-sm bg-white/70 border border-[color-mix(in_oklab,var(--ink)_14%,transparent)] px-3 py-2 outline-none focus:border-[var(--moss)]"
              >
                {finding.suggestions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            {preview ? (
              <div className="grid gap-2 sm:grid-cols-2 text-sm">
                <div className="bg-[color-mix(in_oklab,var(--danger)_8%,white)] px-3 py-2 leading-relaxed">
                  <p className="text-xs uppercase tracking-wider text-[var(--danger)] mb-1">
                    Before
                  </p>
                  {preview.before}
                </div>
                <div className="bg-[color-mix(in_oklab,var(--ok)_10%,white)] px-3 py-2 leading-relaxed">
                  <p className="text-xs uppercase tracking-wider text-[var(--ok)] mb-1">
                    After
                  </p>
                  {preview.after}
                </div>
              </div>
            ) : null}
            {canApplyToSource && chosen ? (
              <button
                type="button"
                onClick={() => onApply(chosen)}
                className="justify-self-start text-sm px-4 py-2 bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--moss-deep)] transition-colors"
              >
                Apply to source & re-check
              </button>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-[var(--moss-deep)]">
            <span className="text-[var(--ink-soft)]">Try: </span>
            {finding.suggestions.join(" · ")}
          </p>
        )}
      </div>
    </li>
  );
}
