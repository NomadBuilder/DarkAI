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
