"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { analyzeText } from "@/lib/analyzer";
import { withBasePath } from "@/lib/base-path";
import { DocumentHighlight } from "@/components/DocumentHighlight";
import { downloadFindingsExport } from "@/lib/export";
import {
  filterIgnoredFindings,
  ignoreKey,
  loadIgnoredKeys,
  saveIgnoredKeys,
} from "@/lib/ignores";
import {
  compactSourceName,
  sourcesForRuleId,
} from "@/lib/rule-sources";
import {
  applyPassageRewrites,
  applySuggestionToText,
  previewRewrite,
} from "@/lib/rewrite";
import { reportFindingIssueUrl } from "@/lib/report";
import { severityLabel } from "@/lib/severity";
import type { AnalysisResult, Finding, Severity } from "@/lib/types";
import { CATEGORY_META } from "@/lib/types";
import { useRulePreferences } from "@/hooks/useRulePreferences";

type Mode = "url" | "text" | "docs";
type ResultsView = "cards" | "document";

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

export function ReviewApp() {
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("https://example.com");
  const [crawlRelated, setCrawlRelated] = useState(true);
  const [text, setText] = useState(FALLBACK_TEXT);
  const [docLabel, setDocLabel] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ignoredKeys, setIgnoredKeys] = useState<string[]>([]);
  const [resultsView, setResultsView] = useState<ResultsView>("cards");
  const [activeFindingId, setActiveFindingId] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
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
    setActiveFindingId(null);
  }

  function runReview() {
    setError(null);
    startTransition(async () => {
      try {
        if (mode === "text" || mode === "docs") {
          if (!text.trim()) {
            throw new Error("Add some text or upload a document first.");
          }
          setPageCount(null);
          analyzeSource(text, {
            sourceType: mode === "docs" ? "document" : "text",
            sourceLabel:
              docLabel ??
              (mode === "docs" ? "uploaded document" : "pasted text"),
            title: mode === "docs" ? "Document review" : "Text review",
          });
          return;
        }

        const normalizedUrl =
          /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
        setUrl(normalizedUrl);

        const response = await fetch(withBasePath("/api/scrape"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: normalizedUrl, crawlRelated }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Could not scrape URL.");
        }

        const pages: Array<{ url: string; title: string; text: string }> =
          Array.isArray(data.pages) && data.pages.length
            ? data.pages
            : [
                {
                  url: data.url || url,
                  title: data.title || "Page",
                  text: data.text || "",
                },
              ];

        setPageCount(pages.length);
        const combined = data.text || pages.map((p) => p.text).join("\n\n");
        setText(combined);
        setDocLabel(null);

        analyzeSource(combined, {
          sourceType: "url",
          sourceLabel: data.url || url,
          title:
            data.title ||
            (pages.length > 1 ? "Multi-page review" : "Page review"),
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

  function applyPassage() {
    if (!text || inclusiveFindings.length === 0) return;
    const { text: next, applied, skippedSoft, skippedCoded } =
      applyPassageRewrites(text, inclusiveFindings, {
        skipSoft: true,
        skipCoded: true,
      });
    if (applied === 0) {
      setError(
        skippedSoft > 0 || skippedCoded > 0
          ? "Nothing to apply — remaining matches are soft-flags or coded heads-ups (not auto-rewritten)."
          : "Nothing to apply.",
      );
      return;
    }
    setError(null);
    setText(next);
    setMode((m) => (m === "url" ? "text" : m));
    analyzeSource(next, {
      sourceType: result?.sourceType === "document" ? "document" : "text",
      sourceLabel: docLabel ?? result?.sourceLabel ?? "edited text",
      title: `Passage rewrite (${applied} applied${skippedSoft ? `, ${skippedSoft} soft skipped` : ""})`,
    });
  }

  const findings = useMemo(() => {
    if (!result) return [];
    return filterIgnoredFindings(result.findings, ignoredKeys);
  }, [result, ignoredKeys]);

  const inclusiveFindings = useMemo(
    () => findings.filter((f) => f.category !== "coded"),
    [findings],
  );

  const codedFindings = useMemo(
    () => findings.filter((f) => f.category === "coded"),
    [findings],
  );

  const ignoredInResult = result
    ? result.findings.length - findings.length
    : 0;

  const severityCounts = useMemo(() => {
    const counts: Partial<Record<Severity, number>> = {};
    for (const f of inclusiveFindings) {
      counts[f.severity] = (counts[f.severity] ?? 0) + 1;
    }
    return counts;
  }, [inclusiveFindings]);

  const softFlagCount = useMemo(
    () => inclusiveFindings.filter((f) => f.likelyFalsePositive).length,
    [inclusiveFindings],
  );

  const resultsHeading = (() => {
    if (findings.length === 0) {
      return ignoredInResult > 0 ? "All matches ignored" : "Nothing flagged";
    }
    const parts: string[] = [];
    if (inclusiveFindings.length) {
      parts.push(
        `${inclusiveFindings.length} phrase${inclusiveFindings.length === 1 ? "" : "s"} to reconsider`,
      );
    }
    if (codedFindings.length) {
      parts.push(
        `${codedFindings.length} possible coded signal${codedFindings.length === 1 ? "" : "s"}`,
      );
    }
    return parts.join(" · ");
  })();

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
          <div className="grid gap-3">
            <label className="grid gap-2">
            <span className="text-sm text-[var(--ink-soft)]">
              Public page to scrape and review (https:// is added if you omit it)
            </span>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://"
                className="w-full bg-white/70 border border-[color-mix(in_oklab,var(--ink)_14%,transparent)] px-4 py-3 text-[var(--ink)] outline-none focus:border-[var(--moss)]"
              />
            </label>
            <label className="flex items-start gap-2 text-sm text-[var(--ink-soft)] max-w-xl">
              <input
                type="checkbox"
                checked={crawlRelated}
                onChange={(e) => setCrawlRelated(e.target.checked)}
                className="mt-1"
              />
              <span>
                Also crawl related same-site pages (about, careers, product,
                team…) — up to 4 extra URLs
              </span>
            </label>
          </div>
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
            {drift.disabled > 0 ? (
              <span className="text-[var(--warn)]">
                {" "}
                ({drift.disabled} rules off)
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
              {resultsHeading}
            </h2>
            <p className="text-[var(--ink-soft)]">
              {result.title ? `${result.title} · ` : ""}
              {result.sourceLabel}
              {pageCount && pageCount > 1 ? (
                <span> · {pageCount} pages crawled</span>
              ) : null}
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

          {inclusiveFindings.length > 0 || codedFindings.length > 0 ? (
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {inclusiveFindings.length > 0 ? (
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--ink-soft)]">
                  <span>
                    Worth fixing{" "}
                    <strong className="text-[var(--danger)] font-medium">
                      {severityCounts.high ?? 0}
                    </strong>
                  </span>
                  <span>
                    Consider{" "}
                    <strong className="text-[var(--warn)] font-medium">
                      {severityCounts.medium ?? 0}
                    </strong>
                  </span>
                  <span>
                    Optional{" "}
                    <strong className="text-[var(--moss)] font-medium">
                      {severityCounts.low ?? 0}
                    </strong>
                  </span>
                  {softFlagCount > 0 ? (
                    <span>
                      Likely false positive{" "}
                      <strong className="text-[var(--warn)] font-medium">
                        {softFlagCount}
                      </strong>
                    </span>
                  ) : null}
                </div>
              ) : null}
              {codedFindings.length > 0 ? (
                <span className="text-sm text-[var(--ink-soft)]">
                  Coded heads-ups{" "}
                  <strong className="text-[var(--indigo)] font-medium">
                    {codedFindings.length}
                  </strong>
                </span>
              ) : null}
              <div className="flex flex-wrap gap-2 ml-auto">
                {inclusiveFindings.some(
                  (f) => !f.likelyFalsePositive && f.suggestions[0],
                ) ? (
                  <button
                    type="button"
                    onClick={applyPassage}
                    className="text-xs px-3 py-1.5 bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--moss-deep)] transition-colors"
                    title="Applies inclusive suggestions only — coded signals are never auto-rewritten"
                  >
                    Rewrite passage
                  </button>
                ) : null}
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
          ) : null}

          {findings.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                type="button"
                onClick={() => setResultsView("cards")}
                className={`text-xs px-3 py-1.5 border transition-colors ${
                  resultsView === "cards"
                    ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]"
                    : "text-[var(--ink-soft)] border-[color-mix(in_oklab,var(--ink)_18%,transparent)]"
                }`}
              >
                Finding cards
              </button>
              <button
                type="button"
                onClick={() => setResultsView("document")}
                className={`text-xs px-3 py-1.5 border transition-colors ${
                  resultsView === "document"
                    ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]"
                    : "text-[var(--ink-soft)] border-[color-mix(in_oklab,var(--ink)_18%,transparent)]"
                }`}
              >
                Side-by-side document
              </button>
            </div>
          ) : null}

          {findings.length === 0 ? (
            <p className="text-[var(--ink-soft)]">
              Nothing to show. Ignored matches stay quiet until you clear them.
            </p>
          ) : resultsView === "document" ? (
            <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-wider text-[var(--moss)]">
                    Source with highlights
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("text");
                      setResultsView("cards");
                    }}
                    className="text-xs text-[var(--ink-soft)] underline underline-offset-2"
                  >
                    Edit source text
                  </button>
                </div>
                <DocumentHighlight
                  text={text}
                  findings={findings}
                  activeId={activeFindingId}
                  onSelect={(f) => {
                    setActiveFindingId(f.id);
                    document
                      .getElementById(`finding-${f.id}`)
                      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                  }}
                />
                <p className="text-xs text-[var(--ink-soft)]">
                  Coral = language to reconsider · indigo dashed = possible coded
                  signal
                </p>
              </div>
              <div className="grid gap-8 max-h-[min(70vh,36rem)] overflow-auto pr-1">
                {inclusiveFindings.length > 0 ? (
                  <FindingsLane
                    title="Language to reconsider"
                    accent="var(--coral)"
                    intro="Prefer clearer, more inclusive phrasing when it fits."
                  >
                    {inclusiveFindings.map((finding) => (
                      <FindingRow
                        key={finding.id}
                        finding={finding}
                        lane="inclusive"
                        active={activeFindingId === finding.id}
                        onIgnore={() => ignoreFinding(finding)}
                        onApply={(suggestion) =>
                          applyRewrite(finding, suggestion)
                        }
                        canApplyToSource={Boolean(text)}
                        onFocus={() => setActiveFindingId(finding.id)}
                      />
                    ))}
                  </FindingsLane>
                ) : null}
                {codedFindings.length > 0 ? (
                  <FindingsLane
                    title="Possible coded signals"
                    accent="var(--indigo)"
                    intro="These phrases are sometimes used as dogwhistles. Many people repeat them without knowing — a heads-up, not a verdict. Not included in Rewrite passage."
                  >
                    {codedFindings.map((finding) => (
                      <FindingRow
                        key={finding.id}
                        finding={finding}
                        lane="coded"
                        active={activeFindingId === finding.id}
                        onIgnore={() => ignoreFinding(finding)}
                        onApply={() => undefined}
                        canApplyToSource={false}
                        onFocus={() => setActiveFindingId(finding.id)}
                      />
                    ))}
                  </FindingsLane>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="grid gap-12">
              {inclusiveFindings.length > 0 ? (
                <FindingsLane
                  title="Language to reconsider"
                  accent="var(--coral)"
                  intro="Prefer clearer, more inclusive phrasing when it fits."
                >
                  {inclusiveFindings.map((finding) => (
                    <FindingRow
                      key={finding.id}
                      finding={finding}
                      lane="inclusive"
                      onIgnore={() => ignoreFinding(finding)}
                      onApply={(suggestion) =>
                        applyRewrite(finding, suggestion)
                      }
                      canApplyToSource={Boolean(text)}
                    />
                  ))}
                </FindingsLane>
              ) : null}
              {codedFindings.length > 0 ? (
                <FindingsLane
                  title="Possible coded signals"
                  accent="var(--indigo)"
                  intro="These phrases are sometimes used as dogwhistles. Many people repeat them without knowing — a heads-up, not a verdict. Not included in Rewrite passage."
                >
                  {codedFindings.map((finding) => (
                    <FindingRow
                      key={finding.id}
                      finding={finding}
                      lane="coded"
                      onIgnore={() => ignoreFinding(finding)}
                      onApply={() => undefined}
                      canApplyToSource={false}
                    />
                  ))}
                </FindingsLane>
              ) : null}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function FindingsLane({
  title,
  accent,
  intro,
  children,
}: {
  title: string;
  accent: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4">
      <header>
        <div className="h-1 w-12 mb-3" style={{ background: accent }} aria-hidden />
        <h3
          className="text-2xl text-[var(--ink)] mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h3>
        <p className="text-sm text-[var(--ink-soft)] leading-relaxed max-w-2xl">
          {intro}
        </p>
      </header>
      <ul className="grid gap-5">{children}</ul>
    </section>
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

function FindingRow({
  finding,
  lane,
  onIgnore,
  onApply,
  canApplyToSource,
  active,
  onFocus,
}: {
  finding: Finding;
  lane: "inclusive" | "coded";
  onIgnore: () => void;
  onApply: (suggestion: string) => void;
  canApplyToSource: boolean;
  active?: boolean;
  onFocus?: () => void;
}) {
  const [chosen, setChosen] = useState(finding.suggestions[0] ?? "");
  const preview =
    lane === "inclusive" && chosen ? previewRewrite(finding, chosen) : null;
  const sources =
    lane === "coded"
      ? sourcesForRuleId(finding.ruleId, finding.category)
      : [];
  const badges = [
    ...new Map(
      sources.map((s) => [compactSourceName(s.title), s] as const),
    ).values(),
  ].slice(0, 4);

  return (
    <li
      id={`finding-${finding.id}`}
      onClick={onFocus}
      className={`grid gap-3 md:grid-cols-[7.5rem_1fr] border-b border-[color-mix(in_oklab,var(--ink)_10%,transparent)] pb-5 ${
        active
          ? "bg-[color-mix(in_oklab,var(--moss)_8%,transparent)] -mx-2 px-2 rounded-sm"
          : ""
      }`}
    >
      <div className="pt-1 grid gap-2">
        {lane === "inclusive" ? (
          <span
            className={`inline-block text-[0.7rem] tracking-wide px-2 py-1 ${severityClass(finding.severity)}`}
          >
            {severityLabel(finding.severity)}
          </span>
        ) : (
          <span className="inline-block text-[0.65rem] tracking-wide px-2 py-1 text-[var(--indigo)] bg-[color-mix(in_oklab,var(--indigo)_12%,white)]">
            Decode
          </span>
        )}
        {finding.likelyFalsePositive ? (
          <span className="inline-block text-[0.65rem] tracking-wide px-2 py-1 text-[var(--warn)] bg-[color-mix(in_oklab,var(--warn)_12%,white)]">
            {lane === "coded"
              ? "Heads-up — check context"
              : "Likely false positive"}
          </span>
        ) : null}
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
            {lane === "inclusive" ? (
              <span className="text-xs uppercase tracking-wider text-[var(--moss)]">
                {CATEGORY_META[finding.category].title}
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={
                lane === "coded"
                  ? `/dogwhistles#${finding.ruleId}`
                  : `/swap/?q=${encodeURIComponent(finding.match)}`
              }
              className="text-xs text-[var(--moss-deep)] underline underline-offset-2 hover:text-[var(--ink)]"
            >
              {lane === "coded" ? "Open dogwhistle guide" : "Look up in Swap"}
            </Link>
            <button
              type="button"
              onClick={onIgnore}
              className="text-xs text-[var(--ink-soft)] underline underline-offset-2 hover:text-[var(--ink)]"
            >
              {lane === "coded" ? "I meant it differently" : "Not this match"}
            </button>
            <a
              href={reportFindingIssueUrl(finding)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--ink-soft)] underline underline-offset-2 hover:text-[var(--ink)]"
            >
              Report wrong suggestion
            </a>
          </div>
        </div>
        <p className="font-[family-name:var(--font-mono)] text-sm text-[var(--ink)]">
          “{finding.match}”
          {finding.source ? (
            <span className="text-[var(--ink-soft)]"> · {finding.source}</span>
          ) : null}
        </p>
        {lane === "coded" ? (
          <p className="text-sm text-[var(--indigo)] max-w-3xl leading-relaxed">
            This can signal: {finding.why}
          </p>
        ) : (
          <p className="text-[var(--ink-soft)] text-[0.95rem] leading-relaxed max-w-3xl">
            {finding.why}
          </p>
        )}
        {finding.contextNote ? (
          <p className="text-sm text-[var(--warn)] max-w-3xl">
            {finding.contextNote}
          </p>
        ) : null}

        {lane === "coded" && badges.length > 0 ? (
          <p className="text-sm text-[var(--ink-soft)]">
            <span className="text-[var(--ink)]">Learn more: </span>
            {badges.map((s, i) => (
              <span key={s.href + s.title}>
                {i > 0 ? " · " : null}
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--teal-deep)] underline underline-offset-2 hover:text-[var(--ink)]"
                >
                  {compactSourceName(s.title)}
                </a>
              </span>
            ))}
          </p>
        ) : null}

        {lane === "coded" && finding.suggestions.length > 0 ? (
          <p className="text-sm text-[var(--ink-soft)] max-w-3xl leading-relaxed">
            <span className="text-[var(--ink)]">If you didn’t mean the coded
            sense: </span>
            {finding.suggestions.join(" · ")}
          </p>
        ) : null}

        {lane === "inclusive" && finding.suggestions.length > 0 ? (
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
        ) : null}
      </div>
    </li>
  );
}
