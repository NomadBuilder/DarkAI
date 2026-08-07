export interface SourceLink {
  title: string;
  href: string;
  note?: string;
}

export interface SourceGroup {
  id: string;
  title: string;
  summary: string;
  links: SourceLink[];
}

/**
 * Public references that informed the Anti-Default rule catalog.
 * The catalog is a curated heuristic set, not a verbatim copy of any one guide.
 */
export const SOURCE_GROUPS: SourceGroup[] = [
  {
    id: "how",
    title: "How the list was built",
    summary:
      "Anti-Default’s rules were curated from inclusive-language guidance — style guides, journalism handbooks, disability and LGBTQ+ media guides, tech writing norms — plus a small set of widely documented dogwhistles so people can notice coded language they may repeat without knowing. It is a starting set you can tune, not an official standard.",
    links: [],
  },
  {
    id: "gender",
    title: "Gender-inclusive",
    summary:
      "Male-default wording, binary address, and gendered job titles.",
    links: [
      {
        title: "APA Style — Bias-free language (gender)",
        href: "https://apastyle.apa.org/style-grammar-guidelines/bias-free-language/gender",
        note: "mankind, singular they, gendered roles",
      },
      {
        title: "United Nations — Gender-inclusive language",
        href: "https://www.un.org/en/gender-inclusive-language/",
        note: "he/she pairings, chairperson, occupation titles",
      },
      {
        title: "GLAAD Media Reference Guide",
        href: "https://glaad.org/reference",
        note: "binary framing and inclusive address in media",
      },
    ],
  },
  {
    id: "lgbtq",
    title: "LGBTQ+ respect",
    summary:
      "Outdated clinical terms, “lifestyle” framing, and affirming pronoun language.",
    links: [
      {
        title: "GLAAD Media Reference Guide",
        href: "https://glaad.org/reference",
        note: "homosexual, lifestyle, transgendered, sex change, biological male/female, closed compounds, ROGD framing",
      },
      {
        title: "APA Style — Sexual orientation",
        href: "https://apastyle.apa.org/style-grammar-guidelines/bias-free-language/sexual-orientation",
        note: "orientation vs preference; identity-affirming wording",
      },
    ],
  },
  {
    id: "ableist",
    title: "Ableist language",
    summary:
      "Disability-as-insult metaphors and outdated medicalized phrasing.",
    links: [
      {
        title: "National Center on Disability and Journalism — Style Guide",
        href: "https://ncdj.org/style-guide/",
        note: "wheelchair-bound, suffers from, handicapped, mental-health metaphors",
      },
      {
        title: "CDC — Communicating with and about people with disabilities",
        href: "https://www.cdc.gov/ncbddd/disabilityandhealth/materials/factsheets/fs-communicating-with-people.html",
        note: "people-first / clear disability language",
      },
    ],
  },
  {
    id: "racialized",
    title: "Racialized & othering",
    summary:
      "Coded hierarchy language, racialized idioms, and tech metaphors that pair light/dark or master/slave with good/bad.",
    links: [
      {
        title: "APA Style — Racial and ethnic identity",
        href: "https://apastyle.apa.org/style-grammar-guidelines/bias-free-language/racial-and-ethnic-identity",
        note: "Oriental, vague “ethnic,” identity-specific naming",
      },
      {
        title: "Conscious Style Guide",
        href: "https://consciousstyleguide.com/",
        note: "whitelist/blacklist, master/slave, grandfathered, immigration language",
      },
      {
        title: "‘Illegal immigrant’ no more — The Associated Press",
        href: "https://www.ap.org/the-definitive-source/announcements/illegal-immigrant-no-more/",
        note: "AP Stylebook shift away from labeling people as “illegal”",
      },
    ],
  },
  {
    id: "colonial",
    title: "Colonial & Eurocentric",
    summary:
      "Discovery myths, Third World hierarchies, and casual appropriation of Indigenous terms.",
    links: [
      {
        title: "Native American Journalists Association — resources",
        href: "https://najanewsroom.com/",
        note: "Indigenous naming, accuracy, and media practice",
      },
      {
        title: "Conscious Style Guide — Indigenous & colonial language",
        href: "https://consciousstyleguide.com/",
        note: "discovery framing, appropriation metaphors (powwow, spirit animal, etc.)",
      },
      {
        title: "World Bank / development language (income & region terms)",
        href: "https://blogs.worldbank.org/en/opendata/new-world-bank-country-classifications-income-level",
        note: "preference for precise income/region labels over “Third World”",
      },
    ],
  },
  {
    id: "age-class-tech",
    title: "Age, class & workplace / tech defaults",
    summary:
      "Ageist shorthand, class-coded insults, and hiring or engineering metaphors.",
    links: [
      {
        title: "APA Style — Age",
        href: "https://apastyle.apa.org/style-grammar-guidelines/bias-free-language/age",
        note: "older adults vs “the elderly”",
      },
      {
        title: "GitHub — Renaming the default branch from master",
        href: "https://github.com/github/renaming",
        note: "master → main; related allowlist/denylist discussions in open source",
      },
      {
        title: "Conscious Style Guide — workplace & bias",
        href: "https://consciousstyleguide.com/",
        note: "culture fit, hyperbolic job titles, class-coded language",
      },
    ],
  },
  {
    id: "coded",
    title: "Coded language & dogwhistles",
    summary:
      "Far-right and conspiracy phrases that can look ordinary to outsiders. We flag them so people can learn — many are soft heads-ups, because intent isn’t always present. Turn the Coded category off on /rules if you only want inclusive-style checks.",
    links: [
      {
        title: "Indiecator — The language of extremism (dogwhistles)",
        href: "https://indiecator.org/2025/08/03/the-language-of-extremism-on-dogwhistles/",
        note: "14/88, (((echo))), Western values, globalist, Cultural Marxism; notes that not every hit is intentional",
      },
      {
        title: "RationalWiki — Alt-right glossary",
        href: "https://rationalwiki.org/wiki/Alt-right_glossary",
        note: "Broad catalog of memes, codes, and euphemisms — use with context",
      },
      {
        title: "Conspiracy Chart",
        href: "https://conspiracychart.com/",
        note: "Interactive map of conspiracy claims with explainers (Great Replacement, Cultural Marxism, etc.)",
      },
      {
        title: "ADL — Great Replacement explainer",
        href: "https://www.adl.org/resources/backgrounder/great-replacement-explainer",
        note: "Background on the white-nationalist demographic conspiracy frame",
      },
      {
        title: "SPLC — ‘Cultural Marxism’ catching on",
        href: "https://www.splcenter.org/resources/hatewatch/cultural-marxism-catching/",
        note: "How the phrase moved from fringe theory into mainstream smear",
      },
      {
        title: "Antifascists of Reddit — lesser-known dogwhistle glossary",
        href: "https://www.reddit.com/r/AntifascistsofReddit/comments/10uprvw/a_glossary_of_lesser_known_alt_right_dogwhistles/",
        note: "Crowdsourced secondary list — not a style guide",
      },
    ],
  },
];
