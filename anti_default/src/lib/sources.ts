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
      "Anti-Default’s rules were curated from common inclusive-language guidance — major style guides, journalism handbooks, disability and LGBTQ+ media guides, and tech writing norms. It is a starting set you can tune, not an official standard or original research study.",
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
        note: "homosexual, lifestyle, transgendered, sex change, biological male/female",
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
];
