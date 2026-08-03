export type Category =
  | "colonial"
  | "gender"
  | "ableist"
  | "racialized"
  | "lgbtq"
  | "class"
  | "age"
  | "general";

export type Severity = "high" | "medium" | "low";

export interface LanguageRule {
  id: string;
  pattern: string;
  matchWholeWord?: boolean;
  category: Category;
  severity: Severity;
  label: string;
  why: string;
  suggestions: string[];
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
  suggestions: string[];
  context: string;
  index: number;
  source?: string;
}

export interface AnalysisSummary {
  total: number;
  byCategory: Partial<Record<Category, number>>;
  bySeverity: Partial<Record<Severity, number>>;
}

export interface AnalysisResult {
  sourceType: "url" | "text" | "code";
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
      "Assumptions that erase non-binary people or treat male as the default human.",
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
  "general",
];

export const SEVERITIES: Severity[] = ["high", "medium", "low"];
