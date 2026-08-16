export type Category =
  | "colonial"
  | "gender"
  | "ableist"
  | "racialized"
  | "lgbtq"
  | "class"
  | "age"
  | "coded"
  | "general";

export type Severity = "high" | "medium" | "low";

export type RuleSourceRole = "evidence" | "background" | "contested";

/** Drop-in phrase swap vs rewrite advice that must not be applied literally. */
export type SuggestionKind = "swap" | "guidance";

export interface RuleSuggestion {
  text: string;
  kind?: SuggestionKind;
}

/** A reference connected to a rule, with its evidentiary role made explicit. */
export interface RuleSourceRef {
  title: string;
  href: string;
  role?: RuleSourceRole;
  /** The specific claim this source supports; avoids implying it proves the whole rule. */
  supports?: string;
  note?: string;
}

export interface LanguageRule {
  id: string;
  pattern: string;
  matchWholeWord?: boolean;
  category: Category;
  severity: Severity;
  label: string;
  why: string;
  /**
   * Preferred replacements. Strings are fine; use `{ kind: "guidance" }` when the
   * text is advice rather than a lexical swap.
   */
  suggestions: Array<string | RuleSuggestion>;
  /**
   * Explicit advisory alternatives (never drop-in rewrites). Prefer this over
   * stuffing instructions into `suggestions`.
   */
  guidance?: string[];
  /** Snippets that should match this rule (used in corpus / authoring checks). */
  examples?: string[];
  /**
   * Snippets that look similar but must NOT match — cultural, medical, supportive,
   * or idiomatic uses. Also consulted at scan time as hard skips.
   */
  counterexamples?: string[];
  /** Style-guide footnotes shown on /rules. */
  sources?: RuleSourceRef[];
  /**
   * Start as a soft-flag (heads-up / decode). Used for dogwhistles people
   * may repeat without knowing the coded meaning.
   */
  defaultSoft?: boolean;
}

/** Per-rule overrides stored in the browser (or sent with API requests). */
export interface RulePreference {
  enabled?: boolean;
  severity?: Severity;
}

export type RulePreferences = Record<string, RulePreference>;

export interface Finding {
  id: string;
  ruleId: string;
  match: string;
  category: Category;
  severity: Severity;
  label: string;
  why: string;
  /** Swap + guidance texts (swaps first). Prefer `swaps` / `guidance` for UI. */
  suggestions: string[];
  /** Lexical replacements safe to preview/apply. */
  swaps?: string[];
  /** Advice that must not be dropped into the sentence. */
  guidance?: string[];
  context: string;
  index: number;
  source?: string;
  /** Soft-flag: common in quotes / idioms — review carefully. */
  likelyFalsePositive?: boolean;
  contextNote?: string;
  contextModes?: Array<
    | "quote"
    | "legal"
    | "selfDescription"
    | "techIdiom"
    | "orgName"
    | "illnessStory"
  >;
}

export interface AnalysisSummary {
  total: number;
  byCategory: Partial<Record<Category, number>>;
  bySeverity: Partial<Record<Severity, number>>;
}

export interface AnalysisResult {
  sourceType: "url" | "text" | "code" | "document";
  sourceLabel: string;
  title?: string;
  excerptCount: number;
  findings: Finding[];
  summary: AnalysisSummary;
  analyzedAt: string;
}

export const CATEGORY_META: Record<
  Category,
  { title: string; description: string }
> = {
  colonial: {
    title: "Colonial & Eurocentric",
    description:
      "Language that centers Western defaults or frames non-Western peoples as lesser or newly found by outsiders.",
  },
  gender: {
    title: "Gender-inclusive",
    description:
      "Male-as-default wording, binary address, and sexist digs that police or diminish women.",
  },
  ableist: {
    title: "Ableist",
    description:
      "Metaphors and insults that treat disability as deficiency or punchline.",
  },
  racialized: {
    title: "Racialized & othering",
    description:
      "Coded or overt language that racializes, exoticizes, or others people.",
  },
  lgbtq: {
    title: "LGBTQ+ respect",
    description:
      "Outdated or pathologizing terms; prefer identity-affirming language.",
  },
  class: {
    title: "Class & status",
    description:
      "Language that shames poverty or treats wealth as moral virtue.",
  },
  age: {
    title: "Age-inclusive",
    description: "Stereotypes that dismiss people based on age.",
  },
  coded: {
    title: "Coded & dogwhistle",
    description:
      "Phrases that can carry far-right or conspiracy meanings people may repeat without knowing. Shown as heads-ups — context always wins.",
  },
  general: {
    title: "General inclusion",
    description: "Broader phrasing that can exclude or flatten communities.",
  },
};

export const CATEGORY_ORDER: Category[] = [
  "colonial",
  "gender",
  "ableist",
  "racialized",
  "lgbtq",
  "class",
  "age",
  "coded",
  "general",
];

export const SEVERITIES: Severity[] = ["high", "medium", "low"];
