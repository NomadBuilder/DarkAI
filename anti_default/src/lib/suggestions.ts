import type { LanguageRule, RuleSuggestion, SuggestionKind } from "./types";

/**
 * Advice-shaped strings are never safe drop-in rewrites.
 * Prefer declaring `kind: "guidance"` on the rule; this is the fallback.
 */
export function inferSuggestionKind(text: string): SuggestionKind {
  const value = text.trim();
  if (!value) return "guidance";
  if (/[\[\]]/.test(value)) return "guidance";
  if (/\b(?:e\.g\.|for example|if that'?s)\b/i.test(value)) return "guidance";
  if (
    /^(?:name|cite|avoid|ask|describe|remove|do not|don'?t|prefer|use|keep|consider|say what|be specific)\b/i.test(
      value,
    )
  ) {
    return "guidance";
  }
  if (value.length > 48 && /\s(?:or|and|instead|when|rather than)\s/i.test(value)) {
    return "guidance";
  }
  return "swap";
}

export function normalizeSuggestion(
  value: string | RuleSuggestion,
): RuleSuggestion {
  if (typeof value === "string") {
    return { text: value, kind: inferSuggestionKind(value) };
  }
  return {
    text: value.text,
    kind: value.kind ?? inferSuggestionKind(value.text),
  };
}

export function normalizeSuggestions(
  rule: Pick<LanguageRule, "suggestions" | "guidance">,
): { swaps: string[]; guidance: string[]; all: RuleSuggestion[] } {
  const fromSuggestions = rule.suggestions.map(normalizeSuggestion);
  const fromGuidance = (rule.guidance ?? []).map((text) =>
    normalizeSuggestion({ text, kind: "guidance" }),
  );
  const all = [...fromSuggestions, ...fromGuidance];
  const swaps = all.filter((s) => s.kind === "swap").map((s) => s.text);
  const guidance = all.filter((s) => s.kind === "guidance").map((s) => s.text);
  return { swaps, guidance, all };
}

/** Flat suggestion texts for findings / exports (swaps first, then guidance). */
export function suggestionTexts(
  rule: Pick<LanguageRule, "suggestions" | "guidance">,
): string[] {
  const { swaps, guidance } = normalizeSuggestions(rule);
  return [...swaps, ...guidance];
}

export function suggestionDisplayTexts(
  suggestions: Array<string | { text: string }>,
): string[] {
  return suggestions.map((value) =>
    typeof value === "string" ? value : value.text,
  );
}
