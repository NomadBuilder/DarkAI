import type { Finding } from "./types";

/**
 * True when a suggestion can be dropped into the matched phrase without
 * producing nonsense. Advice like “name the behavior” stays guidance-only.
 */
export function isLexicalSuggestion(suggestion: string): boolean {
  const value = suggestion.trim();
  if (!value) return false;
  if (/[\[\]]/.test(value)) return false;
  if (/\b(?:e\.g\.|for example|if that'?s)\b/i.test(value)) return false;
  if (
    /^(?:name|cite|avoid|ask|describe|remove|do not|don'?t|prefer|use|keep|consider|say what|be specific)\b/i.test(
      value,
    )
  ) {
    return false;
  }
  // Multi-clause instructions usually aren't phrase swaps.
  if (value.length > 48 && /\s(?:or|and|instead|when|rather than)\s/i.test(value)) {
    return false;
  }
  return true;
}

/** Replace the matched phrase in context (first case-insensitive hit). */
export function previewRewrite(
  finding: Finding,
  suggestion: string,
): { before: string; after: string } | null {
  if (!isLexicalSuggestion(suggestion)) return null;
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
      if (!f.suggestions.find(isLexicalSuggestion)) {
        skippedNoSuggestion += 1;
        return false;
      }
      return true;
    })
    .slice()
    .sort((a, b) => b.index - a.index);

  let text = source;
  for (const finding of actionable) {
    const suggestion =
      finding.suggestions.find(isLexicalSuggestion) ?? finding.suggestions[0]!;
    text = applySuggestionToText(text, finding, suggestion);
  }

  return {
    text,
    applied: actionable.length,
    skippedSoft,
    skippedCoded,
    skippedNoSuggestion,
  };
}
