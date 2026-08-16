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
 * Public references that informed the Un-Default rule catalog.
 * The catalog is a curated heuristic set, not a verbatim copy of any one guide.
 */
export const SOURCE_GROUPS: SourceGroup[] = [
  {
    id: "how",
    title: "How the list was built",
    summary:
      "Un-Default reviews two claims separately: whether wording deserves a contextual flag, and whether a proposed alternative is actually clearer or less harmful in that context. A source that supports the flag does not automatically validate every replacement. Category guides are background—not proof for each rule—and disputed framing is labeled contested.",
    links: [],
  },
  {
    id: "gender",
    title: "Gender-inclusive",
    summary:
      "Male-default wording, binary address, gendered job titles, and high-signal sexist digs.",
    links: [
      {
        title: "UN Women — Gender-inclusive language guidelines",
        href: "https://www.unwomen.org/sites/default/files/Headquarters/Attachments/Sections/Library/Gender-inclusive%20language/Guidelines-on-gender-inclusive-language-en.pdf",
        note: "Direct guidance and alternatives for male-default collectives, occupational titles, and pronouns",
      },
      {
        title: "GLAAD — Nonbinary People",
        href: "https://glaad.org/reference/nonbinary/",
        note: "Nonbinary-led context for singular they and language that does not assume only two genders",
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
        title: "Trans Journalists Association — Stylebook and Coverage Guide",
        href: "https://www.transjournalists.org/style-guide/",
        note: "Trans-led, term-specific guidance for pronouns, identity, medical language, and anti-trans rhetoric",
      },
      {
        title: "GLAAD — Terms to Avoid",
        href: "https://glaad.org/reference/terms/",
        note: "Direct guidance on homosexual, sexual preference, and lifestyle framing",
      },
      {
        title: "GLAAD — Covering the Transgender Community",
        href: "https://glaad.org/reference/covering-trans-community/",
        note: "Assigned-at-birth terminology and when identity details are relevant",
      },
      {
        title: "interACT — Intersex Media Guide",
        href: "https://interactadvocates.org/intersex-media/",
        note: "Intersex-led terminology and reporting guidance",
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
        note: "Term-specific guidance with identity-first/person-first nuance and community preference",
      },
      {
        title: "Rooted in Rights — Disability Writing Guidelines",
        href: "https://rootedinrights.org/if-youre-writing-about-disability-you-need-to-read-these-guidelines/",
        note: "Disability-community-centered guidance on agency, neutral description, and harmful metaphors",
      },
      {
        title: "Autistic Self Advocacy Network — Identity-First Language",
        href: "https://autisticadvocacy.org/about-asan/identity-first-language/",
        note: "Community-led context showing why preferences vary and person-first is not a universal default",
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
        title: "National Association of Black Journalists — Style Guide",
        href: "https://nabjonline.org/news-media-center/styleguide/",
        note: "Community-specific guidance on racial labels, stereotypes, and non-monolithic description",
      },
      {
        title: "National Association of Hispanic Journalists — Cultural Competence Handbook",
        href: "https://nahj.org/wp-content/uploads/2025/07/2025-NAHJ-Cultural-Competence-Handbook-Final.pdf",
        note: "Direct guidance on immigration status and describing legal circumstances rather than labeling people",
      },
      {
        title: "Asian American Journalists Association — Style Guide",
        href: "https://www.aajastyleguide.org/",
        note: "Community-specific guidance on Asian American identities, stereotypes, names, and pronunciation",
      },
      {
        title: "DC Office of Human Rights — Words Matter",
        href: "https://ohr.dc.gov/sites/default/files/dc/sites/ohr/page_content/attachments/OHR_ORE_RacialEquity_ILG_April2023.pdf",
        note: "Historical context and alternatives for terms including grandfathered",
      },
    ],
  },
  {
    id: "colonial",
    title: "Colonial & Eurocentric",
    summary:
      "Discovery myths, development hierarchies, colonial power, and casual appropriation of Indigenous terms. We prioritize Indigenous-led guidance and sources that name exploitation—not institutional prestige.",
    links: [
      {
        title: "Indigenous Journalists Association — Reporting and Indigenous Terminology Guide",
        href: "https://indigenousjournalists.org/wp-content/uploads/2023/06/NAJA_Reporting_and_Indigenous_Terminology_Guide.pdf",
        note: "Indigenous-led guidance on nation-specific naming, accuracy, identity, and political status",
      },
      {
        title: "Wabanaki Alliance — Media & Style Guide",
        href: "https://wabanakialliance.com/style-guide/",
        note: "Indigenous-led guidance that explicitly privileges Wabanaki perspective and expertise",
      },
      {
        title: "Scotland’s International Development Alliance — Inclusive Language Guide",
        href: "https://intdevalliance.scot/wp-content/uploads/2024/02/Scotlands-International-Development-Alliance-Inclusive-Language-Guide-February-2024.pdf",
        note: "Connects first/third world and development labels to hierarchy, exploitation, and colonial power",
      },
      {
        title: "MSF Anti-Racism Project — Equitable and Inclusive Language",
        href: "https://antiracismproject.msf.mx/assets/files/GuidelinesToEquitableAndInclusiveLanguage.pdf",
        note: "Warns against reductive development and Global South labels; recommends naming places and material conditions",
      },
      {
        title: "ALNAP — Use of language",
        href: "https://alnap.org/policies/glossary/",
        note: "Treats Global North/South as contested relational terms that can expose—or flatten—colonial power",
      },
      {
        title: "Inuit Circumpolar Council — Resolution on the use of Inuit",
        href: "https://www.inuitcircumpolar.com/wp-content/uploads/2019/01/iccexcouncilresolutiononterminuit.pdf",
        note: "An Inuit-led resolution calling for Inuit rather than Eskimo in research and public documents",
      },
      {
        title: "Survival International — Proud, not primitive",
        href: "https://survivalinternational.org/stampitout",
        note: "Connects primitive, savage, and civilized hierarchies to persecution and forced development",
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
        title: "Joseph Rowntree Foundation — Reporting Poverty",
        href: "https://www.jrf.org.uk/narrative-change/reporting-poverty-a-guide-for-media-professionals",
        note: "Co-produced with people experiencing poverty; centers structural causes and agency",
      },
      {
        title: "Street Sense Media — Reporter’s Guide",
        href: "https://streetsensemedia.org/homeless-crisis-reporting-project/reporters-guide/",
        note: "Specificity and self-identification in reporting on homelessness",
      },
      {
        title: "Jobs for the Future — Language Matters Guide",
        href: "https://info.jff.org/hubfs/JFFs%20Language%20Matters%20Guide%20-%20April%202023.pdf",
        note: "Distinguishes skills, credentials, pay, and barriers instead of deficit labels such as unskilled",
      },
      {
        title: "AARP — Language of Aging",
        href: "https://www.aarp.org/pri/topics/aging-experience/language-aging/",
        note: "Research with adults 50+ supporting factual, non-monolithic descriptions",
      },
      {
        title: "National Center to Reframe Aging — Communication Best Practices",
        href: "https://www.reframingaging.org/Portals/0/pdfs/RAI-Communication-Best-Practices-Guide.pdf",
        note: "Evidence-based alternatives to burden, crisis, and decline narratives",
      },
      {
        title: "NIST — Workforce Diversity and Inclusion",
        href: "https://nvlpubs.nist.gov/nistpubs/ir/2021/NIST.IR.8371.pdf",
        note: "Skills-focused hiring criteria instead of subjective similarity and culture screening",
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
        title: "Anti-Defamation League — Hate Symbols Database",
        href: "https://www.adl.org/resources/hate-symbols/search",
        note: "Term-specific documentation for 14/88, echo parentheses, Blood and Soil, Honkler, and related symbols",
      },
      {
        title: "American Jewish Committee — Translate Hate",
        href: "https://www.ajc.org/translatehate",
        note: "Documents antisemitic codes while distinguishing contextual uses of terms such as globalist",
      },
      {
        title: "Institute for Strategic Dialogue — Extremism Glossary",
        href: "https://www.isdglobal.org/isd-glossary/",
        note: "Specialist definitions and context for extremist movements, narratives, and coded terms",
      },
      {
        title: "Southern Poverty Law Center — Cultural Marxism",
        href: "https://www.splcenter.org/resources/hatewatch/cultural-marxism-catching/",
        note: "Documents the phrase’s conspiracy lineage and movement into mainstream smear rhetoric",
      },
    ],
  },
];
