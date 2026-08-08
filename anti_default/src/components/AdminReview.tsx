"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LANGUAGE_RULES } from "@/lib/rules";
import { sourcesForRule } from "@/lib/rule-sources";
import { DOGWHISTLE_BLURBS } from "@/lib/dogwhistle-guide";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  SEVERITIES,
  type Category,
  type LanguageRule,
  type Severity,
} from "@/lib/types";
import {
  computeProgress,
  coerceReviewDoc,
  downloadReviewJson,
  downloadReviewMarkdown,
  emptyReviewDoc,
  isEdited,
  loadReviewDoc,
  REVIEW_STATUS_META,
  REVIEW_STATUS_ORDER,
  saveReviewDoc,
  type ReviewDoc,
  type ReviewStatus,
  type RuleReview,
} from "@/lib/rule-review";

type StatusFilter = "all" | ReviewStatus | "edited";

const inputClass =
  "w-full bg-white/70 border border-[color-mix(in_oklab,var(--ink)_14%,transparent)] px-3 py-2 outline-none focus:border-[var(--moss)] text-sm";

export function AdminReview() {
  const [doc, setDoc] = useState<ReviewDoc>(() => emptyReviewDoc());
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDoc(loadReviewDoc());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveReviewDoc(doc);
  }, [doc, hydrated]);

  const progress = useMemo(() => computeProgress(doc), [doc]);

  const updateReview = (
    ruleId: string,
    patch: Partial<RuleReview>,
  ) => {
    setDoc((prev) => {
      const existing = prev.reviews[ruleId] ?? {
        ruleId,
        status: "pending" as ReviewStatus,
      };
      const next: RuleReview = {
        ...existing,
        ...patch,
        ruleId,
        reviewedAt: new Date().toISOString(),
      };
      return {
        ...prev,
        updatedAt: new Date().toISOString(),
        reviews: { ...prev.reviews, [ruleId]: next },
      };
    });
  };

  const resetRule = (ruleId: string) => {
    setDoc((prev) => {
      const nextReviews = { ...prev.reviews };
      delete nextReviews[ruleId];
      return {
        ...prev,
        updatedAt: new Date().toISOString(),
        reviews: nextReviews,
      };
    });
  };

  const clearAll = () => {
    if (
      !window.confirm(
        "Clear all review decisions in this browser? Export first if you want to keep them.",
      )
    ) {
      return;
    }
    setDoc((prev) => ({ ...emptyReviewDoc(), reviewer: prev.reviewer }));
  };

  const onImport = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = coerceReviewDoc(JSON.parse(text));
      if (!parsed) {
        window.alert("That file isn't a valid Anti-Default review export.");
        return;
      }
      setDoc(parsed);
    } catch {
      window.alert("Couldn't read that file.");
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LANGUAGE_RULES.filter((rule) => {
      if (categoryFilter !== "all" && rule.category !== categoryFilter) {
        return false;
      }
      const review = doc.reviews[rule.id];
      if (statusFilter === "edited") {
        if (!isEdited(rule, review)) return false;
      } else if (statusFilter !== "all") {
        const status = review?.status ?? "pending";
        if (status !== statusFilter) return false;
      }
      if (!q) return true;
      return (
        rule.label.toLowerCase().includes(q) ||
        rule.why.toLowerCase().includes(q) ||
        rule.pattern.toLowerCase().includes(q) ||
        rule.suggestions.some((s) => s.toLowerCase().includes(q)) ||
        rule.id.includes(q)
      );
    });
  }, [query, categoryFilter, statusFilter, doc.reviews]);

  const grouped = useMemo(() => {
    const map = new Map<Category, LanguageRule[]>();
    for (const category of CATEGORY_ORDER) {
      map.set(
        category,
        filtered.filter((rule) => rule.category === category),
      );
    }
    return map;
  }, [filtered]);

  return (
    <div className="grid gap-8">
      <ReviewToolbar
        doc={doc}
        progress={progress}
        onReviewerChange={(reviewer) =>
          setDoc((prev) => ({ ...prev, reviewer }))
        }
        onExportJson={() => downloadReviewJson(doc)}
        onExportMarkdown={() => downloadReviewMarkdown(doc)}
        onImportClick={() => fileInputRef.current?.click()}
        onClearAll={clearAll}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onImport(file);
          e.target.value = "";
        }}
      />

      <div className="flex flex-wrap gap-3 items-end">
        <label className="flex-1 min-w-[14rem] grid gap-1">
          <span className="text-xs uppercase tracking-wider text-[var(--moss)]">
            Search
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="label, pattern, suggestion, id…"
            className={inputClass}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs uppercase tracking-wider text-[var(--moss)]">
            Topic
          </span>
          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as Category | "all")
            }
            className={inputClass}
          >
            <option value="all">All topics</option>
            {CATEGORY_ORDER.map((id) => (
              <option key={id} value={id}>
                {CATEGORY_META[id].title}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-xs uppercase tracking-wider text-[var(--moss)]">
            Status
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className={inputClass}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="needs_changes">Needs changes</option>
            <option value="rejected">Rejected</option>
            <option value="edited">Edited</option>
          </select>
        </label>
      </div>

      {CATEGORY_ORDER.map((category) => {
        const rules = grouped.get(category) ?? [];
        if (rules.length === 0) return null;
        return (
          <section key={category} className="grid gap-4">
            <header className="border-b border-[color-mix(in_oklab,var(--ink)_12%,transparent)] pb-3">
              <h2
                className="text-2xl text-[var(--ink)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {CATEGORY_META[category].title}
              </h2>
              <p className="text-sm text-[var(--ink-soft)] mt-1 max-w-2xl">
                {CATEGORY_META[category].description}
              </p>
            </header>
            <ul className="grid gap-4">
              {rules.map((rule) => (
                <ReviewRow
                  key={rule.id}
                  rule={rule}
                  review={doc.reviews[rule.id]}
                  onUpdate={(patch) => updateReview(rule.id, patch)}
                  onReset={() => resetRule(rule.id)}
                />
              ))}
            </ul>
          </section>
        );
      })}

      {filtered.length === 0 ? (
        <p className="text-[var(--ink-soft)]">No rules match this filter.</p>
      ) : null}
    </div>
  );
}

function ReviewToolbar({
  doc,
  progress,
  onReviewerChange,
  onExportJson,
  onExportMarkdown,
  onImportClick,
  onClearAll,
}: {
  doc: ReviewDoc;
  progress: ReturnType<typeof computeProgress>;
  onReviewerChange: (reviewer: string) => void;
  onExportJson: () => void;
  onExportMarkdown: () => void;
  onImportClick: () => void;
  onClearAll: () => void;
}) {
  const pct = progress.total
    ? Math.round((progress.reviewed / progress.total) * 100)
    : 0;
  return (
    <div className="grid gap-4 border border-[color-mix(in_oklab,var(--ink)_14%,transparent)] bg-white/60 p-4 md:p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <label className="grid gap-1 min-w-[14rem]">
          <span className="text-xs uppercase tracking-wider text-[var(--moss)]">
            Reviewer
          </span>
          <input
            value={doc.reviewer}
            onChange={(e) => onReviewerChange(e.target.value)}
            placeholder="Your name"
            className={inputClass}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onImportClick} className={btnClass}>
            Import
          </button>
          <button type="button" onClick={onExportMarkdown} className={btnClass}>
            Export changes (.md)
          </button>
          <button
            type="button"
            onClick={onExportJson}
            className={`${btnClass} !border-[var(--moss)] !text-[var(--moss-deep)]`}
          >
            Export review (.json)
          </button>
        </div>
      </div>

      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--ink-soft)]">
          <span>
            {progress.reviewed} / {progress.total} reviewed ({pct}%)
          </span>
          <Stat label="Verified" value={progress.verified} accent="var(--leaf)" />
          <Stat
            label="Needs changes"
            value={progress.needsChanges}
            accent="var(--ochre)"
          />
          <Stat label="Rejected" value={progress.rejected} accent="var(--coral)" />
          <Stat label="Edited" value={progress.edited} accent="var(--teal-deep)" />
          <button
            type="button"
            onClick={onClearAll}
            className="ml-auto text-xs text-[var(--ink-soft)] underline underline-offset-2 hover:text-[var(--coral)]"
          >
            Clear all
          </button>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--ink)_10%,transparent)]"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-[var(--moss)] transition-[width]"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
        Work saves in this browser as you go. Nothing is sent anywhere. Use{" "}
        <strong>Export review (.json)</strong> to hand your decisions back to
        the maintainers, or <strong>Import</strong> to resume from a file.
      </p>
    </div>
  );
}

const btnClass =
  "text-sm px-3 py-2 border border-[color-mix(in_oklab,var(--ink)_18%,transparent)] text-[var(--ink-soft)] hover:text-[var(--ink)] hover:border-[var(--ink-soft)] transition-colors bg-white/50";

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: accent }}
      />
      {label} {value}
    </span>
  );
}

function ReviewRow({
  rule,
  review,
  onUpdate,
  onReset,
}: {
  rule: LanguageRule;
  review?: RuleReview;
  onUpdate: (patch: Partial<RuleReview>) => void;
  onReset: () => void;
}) {
  const status: ReviewStatus = review?.status ?? "pending";
  const edited = isEdited(rule, review);
  const sources = sourcesForRule(rule);
  const blurb =
    rule.category === "coded" ? DOGWHISTLE_BLURBS[rule.id] : undefined;

  const label = review?.label ?? rule.label;
  const why = review?.why ?? rule.why;
  const severity = review?.severity ?? rule.severity;
  const suggestionsText = (review?.suggestions ?? rule.suggestions).join("\n");

  const setSuggestions = (text: string) => {
    const list = text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    onUpdate({ suggestions: list });
  };

  return (
    <li
      id={rule.id}
      className="scroll-mt-24 grid gap-3 border border-[color-mix(in_oklab,var(--ink)_10%,transparent)] bg-white/50 p-4"
      style={{ borderLeft: `4px solid ${REVIEW_STATUS_META[status].accent}` }}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3
          className="text-lg text-[var(--ink)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {label}
        </h3>
        <code className="text-xs font-[family-name:var(--font-mono)] text-[var(--moss-deep)] break-all">
          /{rule.pattern}/i
        </code>
        <span className="text-xs font-[family-name:var(--font-mono)] text-[var(--ink-soft)]">
          {rule.id}
        </span>
        {edited ? (
          <span className="text-xs px-2 py-0.5 rounded-full bg-[color-mix(in_oklab,var(--teal-deep)_16%,transparent)] text-[var(--teal-deep)]">
            edited
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Review status">
        {REVIEW_STATUS_ORDER.map((s) => {
          if (s === "pending") return null;
          const active = status === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => onUpdate({ status: s })}
              className={`text-sm px-3 py-1.5 border transition-colors ${
                active
                  ? "text-white border-transparent"
                  : "text-[var(--ink-soft)] border-[color-mix(in_oklab,var(--ink)_18%,transparent)] hover:text-[var(--ink)]"
              }`}
              style={
                active
                  ? { background: REVIEW_STATUS_META[s].accent }
                  : undefined
              }
              aria-pressed={active}
            >
              {REVIEW_STATUS_META[s].short}
            </button>
          );
        })}
        {(status !== "pending" || edited || review?.notes) ? (
          <button
            type="button"
            onClick={onReset}
            className="text-sm px-3 py-1.5 text-[var(--ink-soft)] underline underline-offset-2 hover:text-[var(--coral)]"
          >
            Reset
          </button>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-xs uppercase tracking-wider text-[var(--moss)]">
            Label
          </span>
          <input
            value={label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs uppercase tracking-wider text-[var(--moss)]">
            Severity
          </span>
          <select
            value={severity}
            onChange={(e) => onUpdate({ severity: e.target.value as Severity })}
            className={inputClass}
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-1">
        <span className="text-xs uppercase tracking-wider text-[var(--moss)]">
          Why this is flagged
        </span>
        <textarea
          value={why}
          onChange={(e) => onUpdate({ why: e.target.value })}
          rows={2}
          className={`${inputClass} resize-y leading-relaxed`}
        />
      </label>

      <label className="grid gap-1">
        <span className="text-xs uppercase tracking-wider text-[var(--moss)]">
          Suggested fixes (one per line)
        </span>
        <textarea
          value={suggestionsText}
          onChange={(e) => setSuggestions(e.target.value)}
          rows={3}
          className={`${inputClass} resize-y leading-relaxed font-[family-name:var(--font-mono)]`}
        />
      </label>

      <label className="grid gap-1">
        <span className="text-xs uppercase tracking-wider text-[var(--moss)]">
          Reviewer notes
        </span>
        <textarea
          value={review?.notes ?? ""}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          rows={2}
          placeholder="Why you verified, changed, or rejected this…"
          className={`${inputClass} resize-y leading-relaxed`}
        />
      </label>

      {blurb ? (
        <details className="text-sm text-[var(--ink-soft)]">
          <summary className="cursor-pointer text-[var(--indigo)]">
            Dogwhistle context
          </summary>
          <div className="grid gap-1 mt-2 pl-3 border-l border-[color-mix(in_oklab,var(--ink)_12%,transparent)]">
            <p>
              <span className="text-[var(--moss)]">Looks like:</span>{" "}
              {blurb.looksLike}
            </p>
            <p>
              <span className="text-[var(--moss)]">Signal:</span> {blurb.signal}
            </p>
            <p>
              <span className="text-[var(--moss)]">When it can be fine:</span>{" "}
              {blurb.whenFine}
            </p>
          </div>
        </details>
      ) : null}

      {sources.length > 0 ? (
        <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
          <span className="uppercase tracking-wider text-[var(--moss)]">
            Sources
          </span>
          {" · "}
          {sources.map((s, i) => (
            <span key={s.href + s.title}>
              {i > 0 ? " · " : null}
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--teal-deep)] underline underline-offset-2 hover:text-[var(--ink)]"
              >
                {s.title}
              </a>
            </span>
          ))}
        </p>
      ) : null}
    </li>
  );
}
