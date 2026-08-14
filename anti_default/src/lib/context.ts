/**
 * Context heuristics for matches — skip tech idioms, quotes, org names,
 * first-person illness stories; soft-flag remaining ambiguous cases.
 */

const WINDOW = 90;

export type ContextMode =
  | "quote"
  | "legal"
  | "selfDescription"
  | "techIdiom"
  | "orgName"
  | "illnessStory";

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
  /\b(?:pursuant\s+to|hereinafter|whereas|plaintiff|defendant|statute|section\s+\d|u\.?s\.?\s*c\.|cfr|herein|thereof|notwithstanding|exhibit\s+[A-Z]|bill\s+\d+|regulation|ordinance|code\s+of\s+conduct|terms\s+of\s+(?:use|service)|privacy\s+policy)\b/i;

const SELF_DESC_NEAR =
  /\b(?:i\s+am|i'm|we\s+are|we're|as\s+a|identify\s+as|my\s+pronouns|our\s+pronouns)\b/i;

const FIRST_PERSON_NEAR =
  /\b(?:i|i'm|i've|i'd|me|my|myself|we|we're|we've|our|ours)\b/i;

const ILLNESS_NEAR =
  /\b(?:cancer|illness|disease|diagnos(?:is|ed)|depression|anxiety|ptsd|bipolar|schizophrenia|chronic|pain|hospital|symptom|flare|remission|chemotherapy|treatment|disability|disabled|neurodiverg)\w*\b/i;

const ORG_SUFFIX_NEAR =
  /\b(?:cancer|foundation|society|campaign|organization|organisation|initiative|project|coalition|alliance|network|fund|institute|association|collective)\b/i;

/** Ableist metaphor / insult rules — skip more aggressively in quotes & illness stories. */
const ABLEIST_METAPHOR_RULES = new Set([
  "crazy",
  "lame",
  "dumb",
  "stupid-as-default",
  "blind-to",
  "crippled",
  "suffers-from",
  "spaz",
  "sanity-check",
  "ocd-metaphor",
  "bipolar-metaphor",
  "wheelchair-bound",
  "handicapped",
  "retarded",
]);

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

/**
 * Proper-name / org-style uses: "Stupid Cancer", "Crazy Horse Foundation",
 * or “called/named …”. Avoids Title Case job titles like “Congressman Max”.
 */
export function looksLikeOrgOrProperName(
  text: string,
  index: number,
  length: number,
): boolean {
  const matched = text.slice(index, index + length);
  if (!matched || matched[0] !== matched[0].toUpperCase()) return false;

  const after = text.slice(index + length, index + length + 48);
  const before = text.slice(Math.max(0, index - 48), index);
  const afterWord = after.match(/^\s+([A-Za-z']+)/)?.[1];

  // Capitalized match + org-ish next word (Stupid Cancer, Lame Duck Society)
  if (afterWord && /^[A-Z]/.test(afterWord) && ORG_SUFFIX_NEAR.test(afterWord)) {
    return true;
  }

  // “… called Crazy …” / “… named Stupid Cancer …”
  if (
    /\b(?:called|named|known\s+as)\b/i.test(before) &&
    /^[A-Z]/.test(matched)
  ) {
    return true;
  }

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
  if (ruleId === "groomer-smear") {
    return {
      excludeNear:
        /\b(?:dog|cat|pet|horse|animal|hair|nail|salon|spa)\b.{0,20}\bgroomers?\b|\bgroomers?\b.{0,20}\b(?:dog|cat|pet|salon|spa|business)\b/i,
    };
  }
  if (ruleId === "globalist-smear") {
    return {
      softExcludeNear:
        /\b(?:trade|WTO|IMF|World Bank|multilateral|supply chain|offshoring)\b/i,
    };
  }
  if (ruleId === "remigration") {
    return {
      softExcludeNear:
        /\b(?:voluntary|assisted)\s+(?:return|departure|repatriation)\b|\brepatriation\s+program/i,
    };
  }
  if (ruleId === "soy-boy") {
    return {
      softExcludeNear: /\b(?:tofu|edamame|soy\s+(?:milk|sauce|protein|beans?))\b/i,
    };
  }
  if (ruleId === "mutilation-transition") {
    return {
      softExcludeNear:
        /\bfemale genital mutilation\b|\bFGM\b|\bcourt[- ]ordered\b|\bchemical castration (?:of|for) (?:sex )?offenders?\b/i,
    };
  }
  if (ruleId === "social-contagion-trans") {
    return {
      softExcludeNear:
        /\b(?:measles|influenza|covid|epidemiolog|virus|infection rate)\b/i,
    };
  }
  if (ruleId === "old-people") {
    return {
      // Cultural / idiomatic uses of “the old …” that are not about older adults.
      excludeNear:
        /\bthe old\s+(?:ways?|days?|world|fashioned|guard|testament|school|country)\b/i,
    };
  }
  if (ruleId === "kids-these-days") {
    return {
      // Affirmative community language, not generational sneering.
      excludeNear:
        /\b(?:support(?:ing|s)?|empower(?:ing|s)?|mentor(?:ing|s)?|serv(?:ing|e|es)|for|with|our|help(?:ing|s)?|invest(?:ing|s)? in)\b.{0,40}\b(?:young people today|kids these days|these kids today)\b|\b(?:young people today|kids these days|these kids today)\b.{0,40}\b(?:deserve|need|matter|future|community|culture|elders?)\b/i,
    };
  }
  if (ruleId === "western-values-dogwhistle") {
    return {
      softExcludeNear:
        /\b(?:first\s+nations?|inuit|m[eé]tis|indigenous|aboriginal|native|culture|cultural|heritage|tradition|traditions|ceremony|elder|elders|community|communities)\b/i,
    };
  }
  if (ruleId === "elderly-as-burden") {
    return {
      softExcludeNear:
        /\b(?:caregiv|hospice|palliative|grief|bereave|illness|dying|end[- ]of[- ]life|nursing|home\s+care)\w*\b/i,
      excludeNear: /\belders?\b/i,
    };
  }
  if (ruleId === "suffers-from") {
    return {
      softExcludeNear:
        /\b(?:pain|symptom|illness|disease|patient|palliative|hospice|grief|bereave|diagnos)\w*\b/i,
    };
  }
  return null;
}

export function evaluateMatchContext(
  text: string,
  index: number,
  length: number,
  ruleId: string,
  options?: { counterexamples?: string[] },
): MatchContext {
  const modes: ContextMode[] = [];
  let skip = false;
  let likelyFalsePositive = false;
  let note: string | undefined;
  const nearby = windowAround(text, index, length);
  const hints = hintsForRule(ruleId);
  const ableistMetaphor = ABLEIST_METAPHOR_RULES.has(ruleId);
  const matched = text.slice(index, index + length);

  if (options?.counterexamples?.length) {
    const haystack = nearby.toLowerCase();
    const hit = options.counterexamples.find((example) => {
      const needle = example.toLowerCase().replace(/\s+/g, " ").trim();
      if (!needle) return false;
      return haystack.includes(needle);
    });
    if (hit) {
      return {
        modes,
        likelyFalsePositive: false,
        skip: true,
        note: `Skipped — matches a documented counterexample (“${hit}”).`,
      };
    }
  }

  // Extra safety for “the old …” idioms even when counterexamples are incomplete.
  if (
    ruleId === "old-people" &&
    /\bthe old\s+(?:ways?|days?|world|fashioned|guard|testament|school|country)\b/i.test(
      nearby,
    )
  ) {
    return {
      modes,
      likelyFalsePositive: false,
      skip: true,
      note: "Skipped — idiomatic “the old …” (not a label for older adults).",
    };
  }

  void matched;

  if (hints?.excludeNear?.test(nearby)) {
    skip = true;
    note = "Skipped — looks like a non-colonial idiom (e.g. discovered a bug).";
  } else if (hints?.requireNear && !hints.requireNear.test(nearby)) {
    skip = true;
    note = "Skipped — no place/people context near “discovered.”";
  }

  if (!skip && looksLikeOrgOrProperName(text, index, length)) {
    modes.push("orgName");
    skip = true;
    note = "Skipped — looks like an organization or proper name.";
  }

  if (
    !skip &&
    ableistMetaphor &&
    FIRST_PERSON_NEAR.test(nearby) &&
    ILLNESS_NEAR.test(nearby)
  ) {
    modes.push("illnessStory");
    skip = true;
    note =
      "Skipped — first-person illness or disability story; not treating lived experience as a metaphor to “fix.”";
  }

  if (!skip && hints?.softExcludeNear?.test(nearby)) {
    likelyFalsePositive = true;
    note = "Likely fine in this context — soft-flagged.";
  }

  if (!skip && isInsideQuotes(text, index, length)) {
    modes.push("quote");
    if (ableistMetaphor) {
      // Quoted ableist metaphors are almost always someone else’s words.
      skip = true;
      note = "Skipped — inside quotation marks (cited speech, not author framing).";
    } else {
      likelyFalsePositive = true;
      note =
        note ??
        "Inside quotation marks — often a cited speaker, not the author’s framing.";
    }
  }

  if (!skip && LEGAL_NEAR.test(nearby)) {
    modes.push("legal");
    // Legal / policy citations: skip ableist & tech hierarchy metaphors; soft elsewhere.
    if (
      ableistMetaphor ||
      ruleId === "master-slave" ||
      ruleId === "whitelist-blacklist" ||
      ruleId === "grandfathered"
    ) {
      skip = true;
      note = "Skipped — near legal or policy language; may be a required term of art.";
    } else {
      likelyFalsePositive = true;
      note = note ?? "Near legal or policy boilerplate — may be a required term of art.";
    }
  }

  if (!skip && SELF_DESC_NEAR.test(nearby)) {
    modes.push("selfDescription");
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
