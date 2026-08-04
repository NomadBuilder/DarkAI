import type { Finding } from "./types";

/** Replace the matched phrase in context (first case-insensitive hit). */
export function previewRewrite(
  finding: Finding,
  suggestion: string,
): { before: string; after: string } {
  const before = finding.context;
  const re = new RegExp(
    finding.match.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "i",
  );
  const after = before.replace(re, suggestion);
  return { before, after };
}

/** Apply suggestion into full source text at finding.index when possible. */
export function applySuggestionToText(
  source: string,
  finding: Finding,
  suggestion: string,
): string {
  const start = finding.index;
  const end = start + finding.match.length;
  if (
    start >= 0 &&
    end <= source.length &&
    source.slice(start, end).toLowerCase() === finding.match.toLowerCase()
  ) {
    return source.slice(0, start) + suggestion + source.slice(end);
  }
  // Fallback: first case-insensitive occurrence
  const re = new RegExp(
    finding.match.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "i",
  );
  return source.replace(re, suggestion);
}

export interface PassageRewriteResult {
  text: string;
  applied: number;
  skippedSoft: number;
  skippedCoded: number;
  skippedNoSuggestion: number;
}

/**
 * Walk findings and apply the first suggestion to each, right-to-left so
 * indices stay valid. Soft-flags and coded/dogwhistle hits are never applied.
 */
export function applyPassageRewrites(
  source: string,
  findings: Finding[],
  options?: { skipSoft?: boolean; skipCoded?: boolean },
): PassageRewriteResult {
  const skipSoft = options?.skipSoft !== false;
  const skipCoded = options?.skipCoded !== false;
  let skippedSoft = 0;
  let skippedCoded = 0;
  let skippedNoSuggestion = 0;

  const actionable = findings
    .filter((f) => {
      if (skipCoded && f.category === "coded") {
        skippedCoded += 1;
        return false;
      }
      if (skipSoft && f.likelyFalsePositive) {
        skippedSoft += 1;
        return false;
      }
      if (!f.suggestions[0]) {
        skippedNoSuggestion += 1;
        return false;
      }
      return true;
    })
    .slice()
    .sort((a, b) => b.index - a.index);

  let text = source;
  for (const finding of actionable) {
    text = applySuggestionToText(text, finding, finding.suggestions[0]!);
  }

  return {
    text,
    applied: actionable.length,
    skippedSoft,
    skippedCoded,
    skippedNoSuggestion,
  };
}
