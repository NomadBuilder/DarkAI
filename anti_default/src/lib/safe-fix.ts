import type { Finding } from "./types";

/** Preserve ALLCAPS / Title Case when swapping a phrase. */
export function preserveCase(original: string, replacement: string): string {
  if (original === original.toUpperCase() && /[A-Z]/.test(original)) {
    return replacement.toUpperCase();
  }
  if (
    original[0] === original[0]?.toUpperCase() &&
    original.slice(1) === original.slice(1).toLowerCase()
  ) {
    return replacement[0]!.toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

type Fixer = (match: string) => string | null;

/**
 * Only unambiguous 1:1 lexical swaps. Multi-option / contextual rules stay
 * for humans and agents — never auto-applied.
 */
const SAFE_FIXERS: Record<string, Fixer> = {
  policeman: (m) => preserveCase(m, "police officer"),
  fireman: (m) => preserveCase(m, "firefighter"),
  mailman: (m) => preserveCase(m, "mail carrier"),
  salesman: (m) => preserveCase(m, "salesperson"),
  stewardess: (m) => preserveCase(m, "flight attendant"),
  waitress: (m) => preserveCase(m, "server"),
  businessman: (m) => preserveCase(m, "business person"),
  mankind: (m) => preserveCase(m, "humankind"),
  manpower: (m) => preserveCase(m, "workforce"),
  chairman: (m) => preserveCase(m, "chair"),
  "you-guys": (m) => preserveCase(m, "you all"),
  "sanity-check": (m) =>
    /checks$/i.test(m)
      ? preserveCase(m, "quick checks")
      : preserveCase(m, "quick check"),
  "whitelist-blacklist": (m) => {
    const lower = m.toLowerCase();
    if (lower.startsWith("white")) {
      if (lower.endsWith("ing")) return preserveCase(m, "allowlisting");
      if (lower.endsWith("ed")) return preserveCase(m, "allowlisted");
      if (lower.endsWith("s") && !lower.endsWith("ss")) {
        return preserveCase(m, "allowlists");
      }
      return preserveCase(m, "allowlist");
    }
    if (lower.startsWith("black")) {
      if (lower.endsWith("ing")) return preserveCase(m, "denylisting");
      if (lower.endsWith("ed")) return preserveCase(m, "denylisted");
      if (lower.endsWith("s") && !lower.endsWith("ss")) {
        return preserveCase(m, "denylists");
      }
      return preserveCase(m, "denylist");
    }
    return null;
  },
  "master-slave": (m) => {
    if (/master\s*\/\s*slave/i.test(m)) return preserveCase(m, "primary/replica");
    if (/master-slave/i.test(m)) return preserveCase(m, "primary-replica");
    return null;
  },
};

export function isSafeAutofixRule(ruleId: string): boolean {
  return ruleId in SAFE_FIXERS;
}

export function safeReplacementFor(finding: Finding): string | null {
  if (finding.category === "coded") return null;
  if (finding.likelyFalsePositive) return null;
  if (finding.contextModes?.length) return null;
  const fixer = SAFE_FIXERS[finding.ruleId];
  if (!fixer) return null;
  return fixer(finding.match);
}

export interface SafeFixPlan {
  finding: Finding;
  replacement: string;
}

export function planSafeFixes(findings: Finding[]): {
  plans: SafeFixPlan[];
  skipped: number;
} {
  const plans: SafeFixPlan[] = [];
  let skipped = 0;
  for (const finding of findings) {
    const replacement = safeReplacementFor(finding);
    if (!replacement) {
      skipped += 1;
      continue;
    }
    plans.push({ finding, replacement });
  }
  return { plans, skipped };
}
