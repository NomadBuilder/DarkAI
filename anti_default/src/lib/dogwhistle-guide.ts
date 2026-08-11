/**
 * Long-form copy for /dogwhistles — decode, not rewrite.
 * Keys match LanguageRule.id in the coded category.
 */
export interface DogwhistleBlurb {
  /** Plain examples for the UI (regex patterns are hard to read) */
  looksLike: string;
  /** Longer “what it can signal” than rule.why */
  signal: string;
  /** When the same words may be fine or need extra care */
  whenFine: string;
  /** Clearer phrasing if that was the real intent (may overlap suggestions) */
  sayInstead: string[];
}

export const DOGWHISTLE_BLURBS: Record<string, DogwhistleBlurb> = {
  "cultural-marxism": {
    looksLike: "cultural Marxism; cultural Bolshevism",
    signal:
      "Casts feminism, antiracism, LGBTQ+ rights, or multiculturalism as a secret Marxist (often antisemitic) plot to destroy “the West.” It dismisses arguments without engaging them and echoes older “Cultural Bolshevism” smears.",
    whenFine:
      "Almost never neutral in public copy. Academic discussion of the Frankfurt School by name is different — don’t use this slogan as a catch-all for “stuff I disagree with.”",
    sayInstead: [
      "Name the specific policy or theory you oppose",
      "Describe a concrete disagreement with evidence",
      "Avoid conspiracy framing about “secret plots”",
    ],
  },
  "great-replacement": {
    looksLike: "Great Replacement; the replacement theory",
    signal:
      "A white-nationalist conspiracy theory that elites are deliberately replacing white populations through immigration. It has been cited by mass shooters and far-right organizers.",
    whenFine:
      "You can discuss migration statistics, asylum policy, or labor markets with data. The slogan and its “deliberate replacement” storyline are the problem.",
    sayInstead: [
      "Demographic change / migration trends (with sources)",
      "Asylum or immigration policy specifics",
      "Labor-market or housing analysis without conspiracy framing",
    ],
  },
  "blood-and-soil": {
    looksLike: "blood and soil; Blut und Boden",
    signal:
      "A Nazi slogan (Blut und Boden) tying “blood” (ethnicity) to land ownership and belonging. It promotes ethnonationalism and racial purity.",
    whenFine:
      "Rarely if ever fine in civic or marketing copy. Historical quotation in clear educational context may appear in scholarship — label it as such.",
    sayInstead: [
      "Remove the slogan",
      "Describe land stewardship, conservation, or community without racial framing",
    ],
  },
  "echo-parentheses": {
    looksLike: "(((name))) or (((the media)))",
    signal:
      "Triple parentheses (((like this))) are used by white supremacists to mark people or institutions as Jewish and imply secret control.",
    whenFine:
      "Normal parentheses are fine. Three nested pairs around a name or “them/elites” is the tell — don’t use it as ironic formatting.",
    sayInstead: [
      "Remove the triple parentheses",
      "Name the person or organization plainly",
    ],
  },
  "fourteen-eighty-eight": {
    looksLike: "1488; 14/88; 14 / 88",
    signal:
      "1488 / 14/88 combines the white-supremacist “14 words” slogan with “88” (HH = Heil Hitler). Common in graffiti, usernames, and far-right merch.",
    whenFine:
      "Random numbers (birth years, addresses, product SKUs) can coincide. Soft-flagged: check whether the combo is intentional branding or a username flex.",
    sayInstead: [
      "Pick a different numeric ID or handle if unintended",
      "Avoid 14/88 styling in logos and copy",
    ],
  },
  "globalist-smear": {
    looksLike: "globalist; the globalists",
    signal:
      "Can be ordinary critique of globalization — or a coded antisemitic / nativist smear about rootless “elites” controlling nations (often overlapping George Soros / “international finance” tropes).",
    whenFine:
      "Soft heads-up. Talking about WTO rules, offshoring, or multinational tax avoidance can be legitimate. Watch for “the globalists” as a shadowy cabal.",
    sayInstead: [
      "Multinational corporations / specific firms",
      "Trade or tax policy you oppose",
      "Name the institution or practice",
    ],
  },
  "western-values-dogwhistle": {
    looksLike:
      "Western values; Western culture; defend/protect/threaten our way of life",
    signal:
      "Sometimes means democracy, free press, or human rights. In nationalist rhetoric it often codes for ethnocultural belonging, anti-Muslim politics, or opposition to feminism and LGBTQ+ rights. Threat framing around “our way of life” is the stronger signal.",
    whenFine:
      "Soft heads-up. Ordinary cultural or community uses of “our way of life” are not flagged. Naming a specific tradition (due process, free expression) is clearer and harder to misuse.",
    sayInstead: [
      "Name the specific right (free press, due process, equal protection)",
      "Democracy and human rights",
      "Avoid vague civilizational us-vs-them framing",
    ],
  },
  "trans-agenda": {
    looksLike: "trans agenda; gender ideology; gender critical ideology",
    signal:
      "Treats trans people’s existence and rights as a coordinated conspiracy (“agenda” / “gender ideology”) rather than civil rights or health care policy.",
    whenFine:
      "You can debate a specific bill, school policy, or medical guideline by name. The conspiracy packaging is the dogwhistle.",
    sayInstead: [
      "Name the specific policy or bill",
      "Trans people’s rights / equal protection",
      "Gender-affirming care policy (if that’s the topic)",
    ],
  },
  "groomer-smear": {
    looksLike: "groomer (as a political smear)",
    signal:
      "A false, dangerous smear casting LGBTQ+ people, educators, or librarians as sexual predators. It escalates harassment and violence.",
    whenFine:
      "Soft-flagged. Literal discussion of child sexual abuse should name crimes and evidence — not use “groomer” as a political epithet. Pet/salon “dog groomer” is skipped by context.",
    sayInstead: [
      "Do not use as a political smear",
      "Name a specific alleged crime with evidence if one exists",
      "Educator / librarian / advocate (when accurate)",
    ],
  },
  "go-woke-go-broke": {
    looksLike: "go woke, go broke; get woke, go broke",
    signal:
      "A stock culture-war slogan that treats inclusion (casting, HR, marketing) as the cause of business failure — often without evidence.",
    whenFine:
      "Soft heads-up. You can criticize a product, film, or strategy on craft or market grounds without the catchphrase.",
    sayInstead: [
      "Describe the specific business or creative disagreement",
      "Cite sales or reception data if that’s your point",
    ],
  },
  "modern-audience": {
    looksLike: "modern audience (in anti-inclusion rants)",
    signal:
      "In some gaming and media circles, a resentful code for diversity casting or inclusive writing (“they ruined it for the modern audience”).",
    whenFine:
      "Soft heads-up. Ordinary marketing (“appeals to today’s viewers”) is common and often innocent — read the surrounding rant.",
    sayInstead: [
      "Today’s viewers / players",
      "Name the specific creative choice",
      "Diverse casting (if you mean that positively)",
    ],
  },
  "white-genocide": {
    looksLike: "white genocide",
    signal:
      "A white-supremacist conspiracy claim that white people are being deliberately erased through immigration, intermarriage, or policy. Closely tied to Great Replacement rhetoric.",
    whenFine:
      "Not a neutral demographic term. Discuss fertility, migration, or discrimination with evidence — not this slogan.",
    sayInstead: [
      "Demographic change with cited data",
      "Specific policy critique without eliminationist framing",
    ],
  },
  "race-realism": {
    looksLike: "race realism; human biodiversity; HBD",
    signal:
      "“Race realism” and “human biodiversity” (HBD) are euphemisms for scientific racism — claiming fixed racial hierarchies of intelligence or behavior.",
    whenFine:
      "Soft for the acronym HBD alone (could be unrelated). The full phrases in politics or “IQ and race” threads are the tell.",
    sayInstead: [
      "Reject racial hierarchy framing",
      "Discuss inequality via history, policy, and environment — not racial essentialism",
    ],
  },
  "iotbw": {
    looksLike: "it’s okay to be white; IOTBW",
    signal:
      "“It’s okay to be white” began as a 4chan campaign designed to bait media and normalize white-identity politics. It often functions as a recruitment slogan, not a plea against racism.",
    whenFine:
      "Opposing racism against any group is fine in plain language. This exact slogan’s campaign history is the problem.",
    sayInstead: [
      "Oppose racism without the campaign slogan",
      "Affirm everyone’s dignity without ethnonational branding",
    ],
  },
  remigration: {
    looksLike: "remigration; re-migration",
    signal:
      "In far-right European and North American usage, “remigration” means mass removal of immigrants and often citizens of immigrant background — ethnonationalist policy dressed as a technical term.",
    whenFine:
      "Soft heads-up: voluntary return programs exist in policy debates. Watch for “remigration” as a euphemism for ethnic cleansing or deportation of non-white populations.",
    sayInstead: [
      "Voluntary return / assisted departure (if that’s the actual policy)",
      "Asylum or immigration law specifics",
      "Avoid euphemisms for mass ethnic removal",
    ],
  },
  "soy-boy": {
    looksLike: "soy boy; soy-boy",
    signal:
      "A misogynistic / anti-feminist insult claiming soy feminizes men; used to police masculinity and mock liberals or progressive men.",
    whenFine:
      "Soft heads-up. Literal talk about soy food is fine. The insult form targeting people is the dogwhistle.",
    sayInstead: [
      "Drop the insult",
      "Critique ideas or policies without gendered food memes",
    ],
  },
  "kalergi-plan": {
    looksLike: "Kalergi plan; Coudenhove-Kalergi",
    signal:
      "An antisemitic conspiracy theory claiming a secret plan (often blamed on Jewish or “globalist” elites) to destroy Europe through migration. Closely related to Great Replacement myths.",
    whenFine:
      "Not a real historical “plan” in the sense conspiracists mean. Historical Kalergi writings are misrepresented — don’t repeat the conspiracy frame.",
    sayInstead: [
      "Discuss EU migration policy with primary sources",
      "Avoid secret-plot framing",
    ],
  },
  "clown-world": {
    looksLike: "clown world; Honkler; honk honk",
    signal:
      "A nihilistic far-right meme (often with clown emoji 🤡🌎) that frames diversity, LGBTQ+ rights, and immigration as civilization collapsing into absurdity.",
    whenFine:
      "Soft heads-up. Calling a chaotic news day “clownish” isn’t the same as the Honkler / Clown World meme pack.",
    sayInstead: [
      "Describe the specific policy failure or news event",
      "Avoid the meme branding if you don’t mean the far-right frame",
    ],
  },
};
