import { resolveRules } from "./preferences";
import type { Category, LanguageRule, RulePreferences, Severity } from "./types";

export interface PhraseLookupHit {
  ruleId: string;
  label: string;
  why: string;
  category: Category;
  severity: Severity;
  suggestions: string[];
  /** How this rule related to the query. */
  relation: "avoid" | "already-preferred";
  /** Phrase shown as the “from” side (what to reconsider). */
  from: string;
  score: number;
}

function buildRegex(pattern: string, matchWholeWord = false): RegExp {
  const body = matchWholeWord ? `\\b(?:${pattern})\\b` : pattern;
  return new RegExp(body, "gi");
}

/** Best-effort plain phrase from a regex pattern for display / fuzzy match. */
export function patternAsPhrase(pattern: string): string {
  return pattern
    .replace(/\\b/g, "")
    .replace(/\\s\+/g, " ")
    .replace(/\\s\*/g, " ")
    .replace(/\\[swdWSD]/g, "")
    .replace(/\(\?:/g, "(")
    .replace(/[()[\]{}|+*?^$.\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function quotedTerms(label: string): string[] {
  const out: string[] = [];
  for (const m of label.matchAll(/[“"]([^”"]+)[”"]/g)) {
    if (m[1]) out.push(m[1].trim());
  }
  return out;
}

function normalizeQuery(query: string): string {
  return query.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function scoreAvoidMatch(query: string, rule: LanguageRule): number | null {
  const q = query.toLowerCase();
  if (!q) return null;

  try {
    const regex = buildRegex(rule.pattern, rule.matchWholeWord);
    const match = regex.exec(query);
    if (match && match[0]) {
      const covered = match[0].length / Math.max(query.length, 1);
      // Prefer rules that consume most of the query (you guys > guys).
      return 70 + Math.round(covered * 30);
    }
  } catch {
    // Bad pattern — skip regex score.
  }

  const phrase = patternAsPhrase(rule.pattern).toLowerCase();
  if (phrase && (phrase === q || q === phrase)) return 95;

  for (const term of quotedTerms(rule.label)) {
    if (term.toLowerCase() === q) return 90;
  }

  if (phrase && (phrase.includes(q) || q.includes(phrase)) && q.length >= 3) {
    const overlap =
      Math.min(phrase.length, q.length) / Math.max(phrase.length, q.length);
    if (overlap >= 0.5) return Math.round(40 + overlap * 30);
  }

  return null;
}

function scorePreferredMatch(query: string, rule: LanguageRule): number | null {
  const q = query.toLowerCase();
  for (const suggestion of rule.suggestions) {
    const s = suggestion.toLowerCase();
    // Skip long “describe…” guidance as reverse matches.
    if (s.length > 48 || /\bdescribe\b|\bname the\b|\brewrite\b/i.test(s)) {
      continue;
    }
    if (s === q) return 60;
    // Multi-option suggestions like "allowlist / denylist"
    const parts = s.split(/\s*[·/,;]\s*/);
    if (parts.some((p) => p.trim() === q)) return 55;
  }
  return null;
}

function fromLabel(rule: LanguageRule, query: string): string {
  try {
    const regex = buildRegex(rule.pattern, rule.matchWholeWord);
    const match = regex.exec(query);
    if (match?.[0]) return match[0];
  } catch {
    // fall through
  }
  const quoted = quotedTerms(rule.label)[0];
  if (quoted) return quoted;
  const phrase = patternAsPhrase(rule.pattern);
  return phrase || rule.label;
}

/**
 * Look up inclusive alternatives for a word or short phrase.
 * Uses the same rule set as reviews — invitations, not a single correct English.
 */
export function lookupPhrase(
  query: string,
  preferences?: RulePreferences | null,
): PhraseLookupHit[] {
  const normalized = normalizeQuery(query);
  if (!normalized) return [];

  const rules = resolveRules(preferences);
  const hits: PhraseLookupHit[] = [];

  for (const rule of rules) {
    const avoid = scoreAvoidMatch(normalized, rule);
    if (avoid != null) {
      hits.push({
        ruleId: rule.id,
        label: rule.label,
        why: rule.why,
        category: rule.category,
        severity: rule.severity,
        suggestions: rule.suggestions,
        relation: "avoid",
        from: fromLabel(rule, normalized),
        score: avoid,
      });
      continue;
    }

    const preferred = scorePreferredMatch(normalized, rule);
    if (preferred != null) {
      hits.push({
        ruleId: rule.id,
        label: rule.label,
        why: rule.why,
        category: rule.category,
        severity: rule.severity,
        suggestions: rule.suggestions,
        relation: "already-preferred",
        from: fromLabel(rule, normalized),
        score: preferred,
      });
    }
  }

  hits.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));

  // Deduplicate by rule id (keep highest score)
  const seen = new Set<string>();
  return hits.filter((hit) => {
    if (seen.has(hit.ruleId)) return false;
    seen.add(hit.ruleId);
    return true;
  });
}

/** Example queries that reliably hit rules — for empty-state chips. */
export const LOOKUP_EXAMPLES = [
  "you guys",
  "chairman",
  "cultural marxism",
  "crazy",
  "whitelist",
  "globalist",
] as const;
