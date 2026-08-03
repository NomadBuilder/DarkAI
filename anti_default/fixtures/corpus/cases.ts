/**
 * Lived practice-test corpus for Anti-Default.
 *
 * Each case is a real-ish snippet (anonymized / paraphrased from common public copy).
 * We run the analyzer on these whenever rules change so we’re not guessing in the dark.
 *
 * expect:
 *   - "flag"     → must produce at least one finding; if ruleIds set, those must appear
 *   - "no-flag"  → must not produce findings for ruleIds (or any, if ruleIds empty and allowOther false)
 *   - "soft"     → must flag ruleIds, and those hits should be likelyFalsePositive
 */
export type CorpusExpect = "flag" | "no-flag" | "soft";

export interface CorpusCase {
  id: string;
  /** Rough axis for humans browsing the file */
  axis:
    | "colonial"
    | "gender"
    | "ableist"
    | "racialized"
    | "lgbtq"
    | "class"
    | "age"
    | "general"
    | "mixed";
  text: string;
  expect: CorpusExpect;
  /** Rule IDs this case is about */
  ruleIds: string[];
  /** For no-flag: other rules may still fire unless strict */
  strict?: boolean;
  note?: string;
  /**
   * known-gap: documents a miss we care about but haven’t ruled yet.
   * Script warns; does not fail the run.
   */
  knownGap?: boolean;
}

export const CORPUS_CASES: CorpusCase[] = [
  // ── Must catch ─────────────────────────────────────────────────────
  {
    id: "job-native-speakers-only",
    axis: "colonial",
    text: "Requirements: Native English speakers only. Strong culture fit preferred.",
    expect: "flag",
    ruleIds: ["native-speaker-only", "culture-fit"],
  },
  {
    id: "job-guys-mankind",
    axis: "gender",
    text: "Hey guys — join mankind’s mission to hire the best salesman on our team.",
    expect: "flag",
    ruleIds: ["guys-generic", "mankind", "salesman"],
  },
  {
    id: "careers-congressman",
    axis: "gender",
    text: "Congressman Max Rivera will keynote. Ladies and gentlemen, please welcome him.",
    expect: "flag",
    ruleIds: ["congressman", "ladies-and-gentlemen"],
  },
  {
    id: "colonial-third-world",
    axis: "colonial",
    text: "We expanded into Third World markets after pioneers discovered the New World of fintech.",
    expect: "flag",
    ruleIds: ["third-world", "discover-land", "new-world"],
  },
  {
    id: "colonial-powwow-spirit",
    axis: "colonial",
    text: "Let’s pow-wow Friday and find our spirit animal for the brand.",
    expect: "flag",
    ruleIds: ["pow-wow-metaphor", "spirit-animal"],
  },
  {
    id: "ableist-crazy-sanity",
    axis: "ableist",
    text: "It’s a crazy good deal — do a sanity check before launch.",
    expect: "flag",
    ruleIds: ["crazy", "sanity-check"],
  },
  {
    id: "ableist-wheelchair-bound",
    axis: "ableist",
    text: "The building is not ideal for the wheelchair-bound who suffer from mobility issues.",
    expect: "flag",
    ruleIds: ["wheelchair-bound", "suffers-from"],
  },
  {
    id: "racialized-illegal-alien",
    axis: "racialized",
    text: "Op-ed: crackdown on illegal aliens in the inner city.",
    expect: "flag",
    ruleIds: ["illegal-alien", "inner-city-coded"],
  },
  {
    id: "racialized-master-slave",
    axis: "racialized",
    text: "The master/slave database topology is grandfathered into the stack.",
    expect: "flag",
    ruleIds: ["master-slave", "grandfathered"],
  },
  {
    id: "lgbtq-outdated",
    axis: "lgbtq",
    text: "He is a homosexual who had a sex change; list preferred pronouns on the form.",
    expect: "flag",
    ruleIds: ["homosexual", "sex-change", "preferred-pronouns"],
  },
  {
    id: "age-elderly-burden",
    axis: "age",
    text: "We can’t keep subsidizing the elderly as a burden on taxpayers.",
    expect: "flag",
    ruleIds: ["elderly-as-burden"],
  },
  {
    id: "class-welfare-queen",
    axis: "class",
    text: "Tabloid headline recycled the welfare queen stereotype again.",
    expect: "flag",
    ruleIds: ["welfare-queen"],
  },
  {
    id: "tech-whitelist-blacklist",
    axis: "racialized",
    text: "Add bad actors to the blacklist and keep partners on the whitelist.",
    expect: "flag",
    ruleIds: ["whitelist-blacklist"],
  },
  {
    id: "job-ninja-rockstar",
    axis: "general",
    text: "Seeking a coding ninja / marketing rockstar to join the tribe.",
    expect: "flag",
    ruleIds: ["ninja-rockstar", "tribe-generic"],
  },
  {
    id: "oriental-people",
    axis: "colonial",
    text: "The brochure still said Oriental guests are welcome at the spa.",
    expect: "flag",
    ruleIds: ["oriental-people"],
  },
  {
    id: "pregnant-women-only",
    axis: "gender",
    text: "Benefits include leave for pregnant women only; partners excluded.",
    expect: "flag",
    ruleIds: ["pregnant-women-only"],
  },

  // ── Must NOT catch (common false friends) ──────────────────────────
  {
    id: "tech-discovered-bug",
    axis: "colonial",
    text: "We discovered a bug in production overnight.",
    expect: "no-flag",
    ruleIds: ["discover-land"],
    note: "Tech idiom — not colonial discovery framing.",
  },
  {
    id: "tech-discovered-issue",
    axis: "colonial",
    text: "Security research discovered a vulnerability in the library.",
    expect: "no-flag",
    ruleIds: ["discover-land"],
  },
  {
    id: "normal-america-mention",
    axis: "colonial",
    text: "Our office in America ships next week.",
    expect: "no-flag",
    ruleIds: ["discover-land", "new-world"],
    note: "Place name alone is not discovery framing.",
  },
  {
    id: "master-degree",
    axis: "racialized",
    text: "Candidates need a master’s degree in public health.",
    expect: "no-flag",
    ruleIds: ["master-slave", "master-branch"],
  },
  {
    id: "blind-peer-review",
    axis: "ableist",
    text: "Submit for double-blind peer review by Friday.",
    expect: "no-flag",
    ruleIds: ["blind-to"],
    note: "Technical peer-review term — not ‘blind to’ metaphor.",
    // blind-to pattern is "\\bblind (?:to|spot)\\b" — "double-blind" might not match; good
  },
  {
    id: "lifestyle-brand-neutral",
    axis: "lgbtq",
    text: "Our lifestyle brand sells outdoor gear.",
    expect: "no-flag",
    ruleIds: ["lifestyle"],
    // lifestyle rule may be "gay lifestyle" style — check pattern
  },

  // ── Soft / context ─────────────────────────────────────────────────
  {
    id: "quoted-guys",
    axis: "gender",
    text: 'The clip cut to a fan who yelled, "guys, this is wild," before the whistle.',
    expect: "soft",
    ruleIds: ["guys-generic"],
    note: "Quoted speech — still shown, soft-flagged.",
  },
  {
    id: "quoted-crazy",
    axis: "ableist",
    text: 'She said the policy was "crazy" and walked out.',
    expect: "soft",
    ruleIds: ["crazy"],
  },

  // ── Demo fixture (mixed) ───────────────────────────────────────────
  {
    id: "demo-copy-mixed",
    axis: "mixed",
    text: "Welcome guys! Our gurus discovered a primitive workflow that will blow your minds — it's crazy effective. Ladies and gentlemen, our native English speakers only team pioneered this in the Third World market.",
    expect: "flag",
    ruleIds: [
      "guys-generic",
      "guru",
      "primitive",
      "crazy",
      "ladies-and-gentlemen",
      "native-speaker-only",
      "third-world",
    ],
    note: "discover-land should NOT fire (discovered a … workflow).",
  },
  {
    id: "demo-discover-not-colonial",
    axis: "colonial",
    text: "Welcome guys! Our gurus discovered a primitive workflow that will blow your minds — it's crazy effective.",
    expect: "no-flag",
    ruleIds: ["discover-land"],
  },

  // ── Known gaps (warn only until rules exist) ───────────────────────
  {
    id: "gap-digital-native",
    axis: "age",
    text: "Must be a digital native comfortable with TikTok-first campaigns.",
    expect: "flag",
    ruleIds: ["digital-native"],
  },
  {
    id: "gap-young-energetic",
    axis: "age",
    text: "We want young and energetic self-starters for this retail role.",
    expect: "flag",
    ruleIds: ["young-energetic"],
  },
  {
    id: "gap-special-needs",
    axis: "ableist",
    text: "Programs for special needs children meet on Tuesdays.",
    expect: "flag",
    ruleIds: ["special-needs"],
  },
  {
    id: "gap-virgin-land",
    axis: "colonial",
    text: "Settlers claimed the virgin land as empty and unused.",
    expect: "flag",
    ruleIds: ["virgin-land"],
  },
  {
    id: "gap-mother-tongue",
    axis: "colonial",
    text: "Mother tongue must be English; accents will struggle with clients.",
    expect: "flag",
    ruleIds: ["mother-tongue-gate"],
  },
];
