import { LANGUAGE_RULES } from "./rules";
import { resolveRules } from "./preferences";
import { evaluateMatchContext } from "./context";
import type {
  AnalysisResult,
  AnalysisSummary,
  Category,
  Finding,
  RulePreferences,
  Severity,
} from "./types";

const CONTEXT_RADIUS = 72;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildRegex(pattern: string, matchWholeWord = false): RegExp {
  const body = matchWholeWord ? `\\b(?:${pattern})\\b` : pattern;
  return new RegExp(body, "gi");
}

function snippetAround(text: string, index: number, length: number): string {
  const start = Math.max(0, index - CONTEXT_RADIUS);
  const end = Math.min(text.length, index + length + CONTEXT_RADIUS);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return `${prefix}${text.slice(start, end).replace(/\s+/g, " ").trim()}${suffix}`;
}

function summarize(findings: Finding[]): AnalysisSummary {
  const byCategory: Partial<Record<Category, number>> = {};
  const bySeverity: Partial<Record<Severity, number>> = {};

  for (const finding of findings) {
    byCategory[finding.category] = (byCategory[finding.category] ?? 0) + 1;
    bySeverity[finding.severity] = (bySeverity[finding.severity] ?? 0) + 1;
  }

  return {
    total: findings.length,
    byCategory,
    bySeverity,
  };
}

export interface AnalyzeOptions {
  sourceType: AnalysisResult["sourceType"];
  sourceLabel: string;
  title?: string;
  sourceTag?: string;
  preferences?: RulePreferences | null;
}

export function analyzeText(
  text: string,
  options: AnalyzeOptions,
): AnalysisResult {
  const findings: Finding[] = [];
  const normalized = text.replace(/\u00a0/g, " ");
  const rules = resolveRules(options.preferences);

  for (const rule of rules) {
    const regex = buildRegex(rule.pattern, rule.matchWholeWord);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(normalized)) !== null) {
      const matchedText = match[0];
      const ctx = evaluateMatchContext(
        normalized,
        match.index,
        matchedText.length,
        rule.id,
      );
      if (ctx.skip) {
        if (match.index === regex.lastIndex) {
          regex.lastIndex += 1;
        }
        continue;
      }

      findings.push({
        id: `${rule.id}-${match.index}-${findings.length}`,
        ruleId: rule.id,
        match: matchedText,
        category: rule.category,
        severity: rule.severity,
        label: rule.label,
        why: rule.why,
        suggestions: rule.suggestions,
        context: snippetAround(normalized, match.index, matchedText.length),
        index: match.index,
        source: options.sourceTag,
        likelyFalsePositive: ctx.likelyFalsePositive || undefined,
        contextNote: ctx.note,
        contextModes: ctx.modes.length ? ctx.modes : undefined,
      });

      if (match.index === regex.lastIndex) {
        regex.lastIndex += 1;
      }
    }
  }

  findings.sort((a, b) => {
    // Soft-flagged findings sort after confident ones within the same severity
    const severityRank: Record<Severity, number> = {
      high: 0,
      medium: 1,
      low: 2,
    };
    const severityDiff =
      severityRank[a.severity] - severityRank[b.severity];
    if (severityDiff !== 0) return severityDiff;
    const fpDiff =
      Number(Boolean(a.likelyFalsePositive)) -
      Number(Boolean(b.likelyFalsePositive));
    if (fpDiff !== 0) return fpDiff;
    return a.index - b.index;
  });

  return {
    sourceType: options.sourceType,
    sourceLabel: options.sourceLabel,
    title: options.title,
    excerptCount: normalized.trim().length,
    findings,
    summary: summarize(findings),
    analyzedAt: new Date().toISOString(),
  };
}

export function analyzeSegments(
  segments: Array<{ text: string; source: string }>,
  options: Omit<AnalyzeOptions, "sourceTag">,
): AnalysisResult {
  const findings: Finding[] = [];
  let totalChars = 0;

  for (const segment of segments) {
    const partial = analyzeText(segment.text, {
      ...options,
      sourceTag: segment.source,
    });
    totalChars += segment.text.trim().length;
    // Re-base indices are per-segment; keep segment tags for display
    findings.push(...partial.findings);
  }

  findings.sort((a, b) => {
    const severityRank: Record<Severity, number> = {
      high: 0,
      medium: 1,
      low: 2,
    };
    const severityDiff =
      severityRank[a.severity] - severityRank[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return (
      Number(Boolean(a.likelyFalsePositive)) -
      Number(Boolean(b.likelyFalsePositive))
    );
  });

  return {
    sourceType: options.sourceType,
    sourceLabel: options.sourceLabel,
    title: options.title,
    excerptCount: totalChars,
    findings,
    summary: summarize(findings),
    analyzedAt: new Date().toISOString(),
  };
}

/** Exported for tests / CLI helpers */
export function ruleCount(): number {
  return LANGUAGE_RULES.length;
}

export function isSafeHttpUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    if (!["http:", "https:"].includes(url.protocol)) return false;
    const host = url.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host.endsWith(".local") ||
      host === "0.0.0.0" ||
      host === "::1"
    ) {
      return false;
    }
    if (
      /^10\./.test(host) ||
      /^127\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^169\.254\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export { escapeRegex };
