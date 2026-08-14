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
    | "coded"
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
    id: "lgbtq-trans-identified",
    axis: "lgbtq",
    text: "Activists called her a trans-identified male and mocked men in women's spaces.",
    expect: "flag",
    ruleIds: ["trans-identified", "men-in-dresses"],
  },
  {
    id: "lgbtq-rogd",
    axis: "lgbtq",
    text: "The podcast blamed rapid-onset gender dysphoria and gender social contagion for teen transitions.",
    expect: "flag",
    ruleIds: ["rapid-onset-gd", "social-contagion-trans"],
  },
  {
    id: "lgbtq-contagion-soft",
    axis: "lgbtq",
    text: "Commenters called it a gender social contagion sweeping schools.",
    expect: "soft",
    ruleIds: ["social-contagion-trans"],
  },
  {
    id: "lgbtq-transwomen-soft",
    axis: "lgbtq",
    text: "The article referred to several transwomen in the league.",
    expect: "soft",
    ruleIds: ["transwomen-compound"],
  },
  {
    id: "lgbtq-trans-woman-ok",
    axis: "lgbtq",
    text: "The article referred to several trans women in the league.",
    expect: "no-flag",
    ruleIds: ["transwomen-compound"],
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
    expect: "no-flag",
    ruleIds: ["crazy"],
    note: "Quoted ableist metaphor — skipped, not soft-dumped.",
  },
  {
    id: "org-stupid-cancer",
    axis: "ableist",
    text: "We donated to Stupid Cancer after the fundraiser.",
    expect: "no-flag",
    ruleIds: ["stupid-as-default"],
    note: "Organization / proper name.",
  },
  {
    id: "illness-first-person-crazy",
    axis: "ableist",
    text: "After my cancer diagnosis I felt crazy with fear, and my treatment notes said I was anxious.",
    expect: "no-flag",
    ruleIds: ["crazy"],
    note: "First-person illness story — do not treat as metaphor to fix.",
  },
  {
    id: "legal-grandfathered",
    axis: "racialized",
    text: "Pursuant to section 12, preexisting uses are grandfathered under the ordinance.",
    expect: "no-flag",
    ruleIds: ["grandfathered"],
    note: "Legal / policy term of art near boilerplate.",
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

  // ── Coded / dogwhistle ───────────────────────────────────────────────
  {
    id: "coded-cultural-marxism",
    axis: "coded",
    text: "They say Cultural Marxism is destroying the universities.",
    expect: "flag",
    ruleIds: ["cultural-marxism"],
  },
  {
    id: "coded-great-replacement",
    axis: "coded",
    text: "Commenters pushed the Great Replacement theory under the video.",
    expect: "flag",
    ruleIds: ["great-replacement"],
  },
  {
    id: "coded-blood-and-soil",
    axis: "coded",
    text: "The flyer ended with blood and soil rhetoric.",
    expect: "flag",
    ruleIds: ["blood-and-soil"],
  },
  {
    id: "coded-globalist-soft",
    axis: "coded",
    text: "Stop the globalists before they open the borders.",
    expect: "soft",
    ruleIds: ["globalist-smear"],
  },
  {
    id: "coded-dog-groomer-skip",
    axis: "coded",
    text: "We take our poodle to the best dog groomer in town.",
    expect: "no-flag",
    ruleIds: ["groomer-smear"],
  },
  {
    id: "coded-echo-markers",
    axis: "coded",
    text: "They attacked (((the media))) in the thread.",
    expect: "flag",
    ruleIds: ["echo-parentheses"],
  },
  {
    id: "coded-white-genocide",
    axis: "coded",
    text: "The post claimed white genocide is underway in Europe.",
    expect: "flag",
    ruleIds: ["white-genocide"],
  },
  {
    id: "coded-kalergi",
    axis: "coded",
    text: "They cited the Kalergi plan as proof of a secret plot.",
    expect: "flag",
    ruleIds: ["kalergi-plan"],
  },
  {
    id: "coded-iotbw",
    axis: "coded",
    text: "Stickers reading It’s okay to be white appeared overnight.",
    expect: "flag",
    ruleIds: ["iotbw"],
  },
  {
    id: "coded-remigration-soft",
    axis: "coded",
    text: "Party leaders demanded remigration of non-assimilated migrants.",
    expect: "soft",
    ruleIds: ["remigration"],
  },
  {
    id: "coded-soy-boy-soft",
    axis: "coded",
    text: "He mocked him as a soy boy for supporting the bill.",
    expect: "soft",
    ruleIds: ["soy-boy"],
  },
  {
    id: "coded-race-realism-soft",
    axis: "coded",
    text: "The forum thread pushed race realism and HBD talking points.",
    expect: "soft",
    ruleIds: ["race-realism"],
  },
  {
    id: "coded-clown-world-soft",
    axis: "coded",
    text: "Another clown world headline, they wrote under the pride parade photo.",
    expect: "soft",
    ruleIds: ["clown-world"],
  },

  // ── Context false positives from cultural / community copy ──────────
  {
    id: "age-old-ways-skip",
    axis: "age",
    text: "Emotions and Support Communicating in the old ways Encouraging communication",
    expect: "no-flag",
    ruleIds: ["old-people"],
    note: "“the old ways” is tradition, not a label for older adults",
  },
  {
    id: "age-old-people-flag",
    axis: "age",
    text: "Policymakers keep talking about the old as if they are a cost center.",
    expect: "soft",
    ruleIds: ["old-people"],
  },
  {
    id: "age-young-people-support-skip",
    axis: "age",
    text: "Supporting our young people today is how we keep culture alive across generations.",
    expect: "no-flag",
    ruleIds: ["kids-these-days"],
    note: "affirmative community language, not generational dismissal",
  },
  {
    id: "age-kids-these-days-flag",
    axis: "age",
    text: "Kids these days have no respect for hard work.",
    expect: "soft",
    ruleIds: ["kids-these-days"],
  },
  {
    id: "coded-way-of-life-culture-skip",
    axis: "coded",
    text: "Living My Culture shares stories about our way of life across First Nations, Inuit, and Métis communities.",
    expect: "no-flag",
    ruleIds: ["western-values-dogwhistle"],
    note: "bare cultural “our way of life” should not be treated as a dogwhistle",
  },
  {
    id: "coded-way-of-life-threat-flag",
    axis: "coded",
    text: "They claimed immigration was threatening our way of life and western values.",
    expect: "soft",
    ruleIds: ["western-values-dogwhistle"],
  },

  // ── Hospice / grief / cultural-care genre (Virtual Hospice–guided) ──
  {
    id: "hospice-home-nav-skip",
    axis: "mixed",
    text: "Canadian Virtual Hospice. Topics: What Is Palliative Care? Emotional Health. Spiritual Health. Providing Care. Medical Assistance in Dying (MAiD). 2SLGBTQ+ Supporting you to be proud, prepared, and protected.",
    expect: "no-flag",
    ruleIds: [
      "old-people",
      "kids-these-days",
      "western-values-dogwhistle",
      "suffers-from",
      "elderly-as-burden",
    ],
    note: "Homepage-style palliative navigation should stay clean",
  },
  {
    id: "hospice-featured-services-skip",
    axis: "mixed",
    text: "Indigenous Cultural Safety Training helping you build skills and confidence to provide culturally safer care. LivingMyCulture.ca conversations on care, culture, and spirituality when living with serious illness and grief. LivingOutLoud.life stories from young adults living with advanced illness.",
    expect: "no-flag",
    ruleIds: [
      "western-values-dogwhistle",
      "kids-these-days",
      "tribe-generic",
      "spirit-animal",
      "old-people",
    ],
  },
  {
    id: "hospice-grief-youth-skip",
    axis: "age",
    text: "YouthGrief.ca resources by grieving youth, for grieving youth. KidsGrief.ca practical advice for talking with kids and youth about serious illness, dying, and grief. Guidance for schools supporting grieving children and youth.",
    expect: "no-flag",
    ruleIds: ["kids-these-days", "special-needs", "old-people"],
  },
  {
    id: "hospice-caregiving-elderly-soft",
    axis: "age",
    text: "Caregiving tips for families supporting the elderly at home during palliative care.",
    expect: "no-flag",
    ruleIds: ["elderly-as-burden"],
    note: "caregiving + the elderly is a documented counterexample",
  },
  {
    id: "hospice-pain-suffers-soft-or-skip",
    axis: "ableist",
    text: "Many patients say they suffer from unmanaged pain near the end of life.",
    expect: "no-flag",
    ruleIds: ["suffers-from"],
  },
  {
    id: "hospice-asked-answered-skip",
    axis: "mixed",
    text: "Asked and Answered. Find common questions and our answers about life-threatening illness and loss. When death is near: understand the signs. Join the Discussion Forums.",
    expect: "no-flag",
    ruleIds: ["crazy", "lame", "western-values-dogwhistle", "old-people"],
  },
  {
    id: "hospice-maid-lgbtq-skip",
    axis: "lgbtq",
    text: "2SLGBTQ+ supporting you to receive respectful, inclusive care. Medical Assistance in Dying (MAiD) information for patients and families.",
    expect: "no-flag",
    ruleIds: [
      "homosexual",
      "lifestyle",
      "transgendered",
      "preferred-pronouns",
      "groomer-smear",
    ],
  },
  {
    id: "hospice-first-nations-care-skip",
    axis: "colonial",
    text: "Ask which First Nation, Inuit, or Métis community the family belongs to, and follow their teachings about care and grief.",
    expect: "no-flag",
    ruleIds: ["tribe-generic", "eskimo", "spirit-animal", "pow-wow-metaphor"],
  },
  {
    id: "hospice-still-catch-burden-framing",
    axis: "age",
    text: "We can’t keep subsidizing the elderly as a burden on taxpayers.",
    expect: "soft",
    ruleIds: ["elderly-as-burden"],
  },
  {
    id: "job-ad-still-catch-ninja",
    axis: "general",
    text: "We’re hiring a coding ninja and rockstar marketer with culture fit.",
    expect: "flag",
    ruleIds: ["ninja-rockstar", "culture-fit"],
  },
  {
    id: "news-still-catch-illegal-alien",
    axis: "racialized",
    text: "The candidate called asylum seekers illegal aliens during the debate.",
    expect: "flag",
    ruleIds: ["illegal-alien"],
  },
  {
    id: "product-marketing-guys-flag",
    axis: "gender",
    text: "Hey guys, ship mankind’s next breakthrough with our salesman toolkit.",
    expect: "flag",
    ruleIds: ["guys-generic", "mankind", "salesman"],
  },
  {
    id: "tech-docs-master-slave-flag",
    axis: "racialized",
    text: "Configure the master/slave database topology before deploy.",
    expect: "flag",
    ruleIds: ["master-slave"],
  },
  {
    id: "nonprofit-storytelling-support-skip",
    axis: "mixed",
    text: "Our volunteers are supporting our young people today through grief after a parent’s death, using the old ways of visiting and shared meals.",
    expect: "no-flag",
    ruleIds: ["kids-these-days", "old-people", "western-values-dogwhistle"],
  },
];
