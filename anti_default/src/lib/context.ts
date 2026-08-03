/**
 * Context heuristics for matches — skip tech idioms, soft-flag quotes / legal / self-ID.
 */

const WINDOW = 90;

export type ContextMode = "quote" | "legal" | "selfDescription" | "techIdiom";

export interface MatchContext {
  modes: ContextMode[];
  /** Soft-flag: often a false positive; still shown. */
  likelyFalsePositive: boolean;
  /** Hard skip: do not emit a finding. */
  skip: boolean;
  note?: string;
}

const TECH_DISCOVER =
  /\b(?:a\s+bug|the\s+bug|bugs?\b|issues?\b|vulnerabilit(?:y|ies)|errors?\b|flaws?\b|problems?\b|exploits?\b|leaks?\b|race\s+condition|regression|zero[- ]day|security\s+hole)\b/i;

const PLACE_OR_PEOPLE =
  /\b(?:land|lands|america|americas|continent|island|islands|country|countries|nation|nations|people|peoples|tribe|tribes|world|africa|asia|australia|india|canada|mexico|brazil|territory|territories|shore|coast|caribbean|pacific|atlantic|indigenous|native|aboriginal|settler|colony|colon(?:y|ies)|voyage|explorer|expedition)\b/i;

const LEGAL_NEAR =
  /\b(?:pursuant\s+to|hereinafter|whereas|plaintiff|defendant|statute|section\s+\d|u\.?s\.?\s*c\.|cfr|herein|thereof|notwithstanding|exhibit\s+[A-Z])\b/i;

const SELF_DESC_NEAR =
  /\b(?:i\s+am|i'm|we\s+are|we're|as\s+a|identify\s+as|my\s+pronouns|our\s+pronouns)\b/i;

function windowAround(text: string, index: number, length: number): string {
  const start = Math.max(0, index - WINDOW);
  const end = Math.min(text.length, index + length + WINDOW);
  return text.slice(start, end);
}

/** True if the match sits inside quotation marks in the local window. */
export function isInsideQuotes(
  text: string,
  index: number,
  length: number,
): boolean {
  const before = text.slice(Math.max(0, index - 120), index);
  const after = text.slice(index + length, index + length + 120);
  const openStraight = (before.match(/"/g) || []).length;
  const closeStraight = (after.match(/"/g) || []).length;
  if (openStraight % 2 === 1 && closeStraight >= 1) return true;

  const openCurly = (before.match(/[“«]/g) || []).length;
  const closeCurly = (after.match(/[”»]/g) || []).length;
  if (openCurly > closeCurly) return true;

  // Single-quoted spans (news pull-quotes)
  const openSingle = (before.match(/(?:^|[\s([{])'/g) || []).length;
  const closeSingle = (after.match(/'(?:$|[\s)\]}.,;:!?])/g) || []).length;
  if (openSingle > 0 && closeSingle > 0 && openSingle >= closeSingle) return true;

  return false;
}

export interface RuleContextHints {
  /** If set, match is skipped unless this pattern appears nearby. */
  requireNear?: RegExp;
  /** If set, match is skipped when this pattern appears nearby. */
  excludeNear?: RegExp;
  /** Soft-flag when nearby (likely FP). */
  softExcludeNear?: RegExp;
}

/** Built-in context for known ambiguous rules. */
export function hintsForRule(ruleId: string): RuleContextHints | null {
  if (ruleId === "discover-land") {
    return {
      requireNear: PLACE_OR_PEOPLE,
      excludeNear: TECH_DISCOVER,
    };
  }
  if (ruleId === "colonize-metaphor") {
    return {
      softExcludeNear:
        /\b(?:actual|historical|settler|indigenous|anti[- ]?colonial|decolon)\w*\b/i,
    };
  }
  if (ruleId === "primitive") {
    return {
      softExcludeNear: /\b(?:type|data\s+type|int|integer|value|javascript|python|stack)\b/i,
    };
  }
  if (ruleId === "tribe-generic") {
    return {
      softExcludeNear: /\b(?:product|engineering|sales|marketing|customer\s+success)\s+tribe\b/i,
    };
  }
  if (ruleId === "guru") {
    return {
      softExcludeNear: /\b(?:sikh|hindu|spiritual|religious|ashram|teacher)\b/i,
    };
  }
  return null;
}

export function evaluateMatchContext(
  text: string,
  index: number,
  length: number,
  ruleId: string,
): MatchContext {
  const modes: ContextMode[] = [];
  let skip = false;
  let likelyFalsePositive = false;
  let note: string | undefined;
  const nearby = windowAround(text, index, length);
  const hints = hintsForRule(ruleId);

  if (hints?.excludeNear?.test(nearby)) {
    skip = true;
    note = "Skipped — looks like a non-colonial idiom (e.g. discovered a bug).";
  } else if (hints?.requireNear && !hints.requireNear.test(nearby)) {
    skip = true;
    note = "Skipped — no place/people context near “discovered.”";
  }

  if (!skip && hints?.softExcludeNear?.test(nearby)) {
    likelyFalsePositive = true;
    note = "Likely fine in this context — soft-flagged.";
  }

  if (isInsideQuotes(text, index, length)) {
    modes.push("quote");
    likelyFalsePositive = true;
    note =
      note ??
      "Inside quotation marks — often a cited speaker, not the author’s framing.";
  }

  if (LEGAL_NEAR.test(nearby)) {
    modes.push("legal");
    likelyFalsePositive = true;
    note = note ?? "Near legal boilerplate — may be a required term of art.";
  }

  if (SELF_DESC_NEAR.test(nearby)) {
    modes.push("selfDescription");
    // Self-ID is usually intentional; soft-flag identity rules only
    if (
      /^(guys|ladies|homosexual|transgendered|biological-|preferred-pronoun)/.test(
        ruleId,
      ) ||
      ruleId.includes("pronoun") ||
      ruleId.includes("guys") ||
      ruleId.includes("ladies")
    ) {
      likelyFalsePositive = true;
      note =
        note ??
        "Near self-description — the speaker may be naming their own identity.";
    }
  }

  if (hints?.excludeNear && TECH_DISCOVER.test(nearby) && ruleId === "discover-land") {
    modes.push("techIdiom");
  }

  return { modes, likelyFalsePositive, skip, note };
}
