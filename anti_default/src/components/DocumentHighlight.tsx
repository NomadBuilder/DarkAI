"use client";

import type { Finding } from "@/lib/types";

/**
 * Full-document view with highlights at finding indices.
 * Click a highlight to scroll the matching finding card into view.
 */
export function DocumentHighlight({
  text,
  findings,
  activeId,
  onSelect,
}: {
  text: string;
  findings: Finding[];
  activeId?: string | null;
  onSelect: (finding: Finding) => void;
}) {
  const spans = buildSpans(text, findings);

  return (
    <div
      className="document-highlight max-h-[min(70vh,36rem)] overflow-auto bg-white/70 border border-[color-mix(in_oklab,var(--ink)_14%,transparent)] px-4 py-4 text-[0.95rem] leading-relaxed whitespace-pre-wrap font-[family-name:var(--font-body)]"
      role="region"
      aria-label="Source text with highlights"
    >
      {spans.map((span, i) => {
        if (!span.finding) {
          return <span key={`t-${i}`}>{span.text}</span>;
        }
        const f = span.finding;
        const active = activeId === f.id;
        return (
          <button
            key={`f-${f.id}-${i}`}
            type="button"
            onClick={() => onSelect(f)}
            title={`${f.label}${
              f.category === "coded" ? " · possible coded signal" : ""
            }${f.likelyFalsePositive ? " · check context" : ""}`}
            className={`rounded-sm px-0.5 mx-px transition-colors cursor-pointer text-left ${
              f.category === "coded"
                ? "bg-[color-mix(in_oklab,var(--indigo)_18%,white)] outline outline-1 outline-dashed outline-[var(--indigo)]"
                : f.likelyFalsePositive
                  ? "bg-[color-mix(in_oklab,var(--warn)_22%,white)] outline outline-1 outline-dashed outline-[var(--warn)]"
                  : "bg-[color-mix(in_oklab,var(--danger)_18%,white)]"
            } ${active ? "ring-2 ring-[var(--moss-deep)]" : ""}`}
          >
            {span.text}
          </button>
        );
      })}
    </div>
  );
}

function buildSpans(
  text: string,
  findings: Finding[],
): Array<{ text: string; finding?: Finding }> {
  const sorted = [...findings]
    .filter((f) => f.index >= 0 && f.index < text.length)
    .sort((a, b) => a.index - b.index);

  const spans: Array<{ text: string; finding?: Finding }> = [];
  let cursor = 0;

  for (const finding of sorted) {
    const start = finding.index;
    const end = Math.min(text.length, start + finding.match.length);
    if (start < cursor) continue; // overlapping — skip
    if (start > cursor) {
      spans.push({ text: text.slice(cursor, start) });
    }
    spans.push({ text: text.slice(start, end), finding });
    cursor = end;
  }
  if (cursor < text.length) {
    spans.push({ text: text.slice(cursor) });
  }
  return spans;
}
