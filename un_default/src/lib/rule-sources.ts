import type {
  Category,
  LanguageRule,
  RuleSourceRef,
  RuleSourceRole,
} from "./types";

/** Canonical style-guide URLs reused across rules. */
const S = {
  apaGender:
    "https://apastyle.apa.org/style-grammar-guidelines/bias-free-language/gender",
  apaRace:
    "https://apastyle.apa.org/style-grammar-guidelines/bias-free-language/racial-and-ethnic-identity",
  apaOrientation:
    "https://apastyle.apa.org/style-grammar-guidelines/bias-free-language/sexual-orientation",
  apaAge:
    "https://apastyle.apa.org/style-grammar-guidelines/bias-free-language/age",
  unGender: "https://www.un.org/en/gender-inclusive-language/",
  glaad: "https://glaad.org/reference",
  ncdj: "https://ncdj.org/style-guide/",
  cdcDisability:
    "https://www.cdc.gov/ncbddd/disabilityandhealth/materials/factsheets/fs-communicating-with-people.html",
  csg: "https://consciousstyleguide.com/",
  naja: "https://najanewsroom.com/",
  ijaTerminology:
    "https://indigenousjournalists.org/wp-content/uploads/2023/06/NAJA_Reporting_and_Indigenous_Terminology_Guide.pdf",
  wabanakiStyle: "https://wabanakialliance.com/style-guide/",
  nativeGovernance:
    "https://nativegov.org/resources/how-to-talk-about-native-nations/",
  aajaCoverage: "https://oldsite.aaja.org/coverageguide",
  sikhGuru:
    "https://www.sikhcoalition.org/wp-content/uploads/2019/05/TeachingAboutReligion-Chapter-17.pdf",
  hinduGuru:
    "https://www.hinduamerican.org/blog/we-must-respect-the-wisdom-yoga-gurus-pass-on-but-never-lose-our-own-moral-compass/",
  tesolNonnative:
    "https://www.tesol.org/media/d2gfeisk/position-statement-against-nnest-discrimination-march-2006-1.pdf",
  sidaInclusive:
    "https://intdevalliance.scot/wp-content/uploads/2024/02/Scotlands-International-Development-Alliance-Inclusive-Language-Guide-February-2024.pdf",
  msfEquitable:
    "https://antiracismproject.msf.mx/assets/files/GuidelinesToEquitableAndInclusiveLanguage.pdf",
  alnapLanguage: "https://alnap.org/policies/glossary/",
  survivalRespect: "https://survivalinternational.org/stampitout",
  oldNewWorldStudy: "https://pubmed.ncbi.nlm.nih.gov/38032520/",
  iccInuit:
    "https://www.inuitcircumpolar.com/wp-content/uploads/2019/01/iccexcouncilresolutiononterminuit.pdf",
  ictPowwow: "https://www.ictinc.ca/blog/indigenous-powwow-protocol",
  smithsonianSpirit:
    "https://americanindian.si.edu/nk360/pdf/Native-American-Relationships-to-Animals-Not-Your-Spirit-Animal.pdf",
  ictOffensivePhrases:
    "https://www.ictinc.ca/blog/culturally-offensive-phrases",
  aiclPhrases:
    "https://americanindiansinchildrensliterature.blogspot.com/p/all-you-do-is-complain.html",
  ictIndianGiver:
    "https://ictnews.org/archive/what-or-who-is-an-indian-giver-a-history-of-the-offensive-term",
  nativeSpeakerColoniality:
    "https://discovery.ucl.ac.uk/id/eprint/10151298/2/Tupas_13488678.2022.2056797_VoR.pdf",
  climateLanguage: "https://doi.org/10.1162/daed_a_02019",
  darkContinentStudy: "https://doi.org/10.2307/490566",
  decolonizationNotMetaphor:
    "https://civiclaboratory.nl/wp-content/uploads/2021/11/fe633-tuck26yang_decolonizationisnotametaphor2012.pdf",
  apIllegal:
    "https://www.ap.org/the-definitive-source/announcements/illegal-immigrant-no-more/",
  githubMain: "https://github.com/github/renaming",
  rationalWikiAltRight:
    "https://rationalwiki.org/wiki/Alt-right_glossary",
  indiecatorDogwhistles:
    "https://indiecator.org/2025/08/03/the-language-of-extremism-on-dogwhistles/",
  conspiracyChart: "https://conspiracychart.com/",
  adlGreatReplacement:
    "https://www.adl.org/resources/backgrounder/great-replacement-explainer",
  splcCulturalMarxism:
    "https://www.splcenter.org/resources/hatewatch/cultural-marxism-catching/",
  redditDogwhistleGlossary:
    "https://www.reddit.com/r/AntifascistsofReddit/comments/10uprvw/a_glossary_of_lesser_known_alt_right_dogwhistles/",
  unWomenGender:
    "https://www.unwomen.org/sites/default/files/Headquarters/Attachments/Sections/Library/Gender-inclusive%20language/Guidelines-on-gender-inclusive-language-en.pdf",
  glaadNonbinary: "https://glaad.org/reference/nonbinary/",
  rootedDisability:
    "https://rootedinrights.org/if-youre-writing-about-disability-you-need-to-read-these-guidelines/",
  asanIdentity:
    "https://autisticadvocacy.org/about-asan/identity-first-language/",
  nabjStyle: "https://nabjonline.org/news-media-center/styleguide/",
  nahjHandbook:
    "https://nahj.org/wp-content/uploads/2025/07/2025-NAHJ-Cultural-Competence-Handbook-Final.pdf",
  dcWords:
    "https://ohr.dc.gov/sites/default/files/dc/sites/ohr/page_content/attachments/OHR_ORE_RacialEquity_ILG_April2023.pdf",
  transJournalists: "https://www.transjournalists.org/style-guide/",
  glaadTerms: "https://glaad.org/reference/terms/",
  glaadTrans: "https://glaad.org/reference/covering-trans-community/",
  interact: "https://interactadvocates.org/intersex-media/",
  jrfPoverty:
    "https://www.jrf.org.uk/narrative-change/reporting-poverty-a-guide-for-media-professionals",
  streetSense:
    "https://streetsensemedia.org/homeless-crisis-reporting-project/reporters-guide/",
  jffLanguage:
    "https://info.jff.org/hubfs/JFFs%20Language%20Matters%20Guide%20-%20April%202023.pdf",
  aarpAging: "https://www.aarp.org/pri/topics/aging-experience/language-aging/",
  reframeAging:
    "https://www.reframingaging.org/Portals/0/pdfs/RAI-Communication-Best-Practices-Guide.pdf",
  aarpEmployment:
    "https://www.aarp.org/work/employers/age-diversity-inclusion-guide/",
  adlEcho: "https://www.adl.org/resources/hate-symbol/echo",
  adl1488: "https://www.adl.org/resources/hate-symbol/1488",
  adlGerman: "https://www.adl.org/resources/hate-symbol/german-phrases",
  adlIotbw: "https://www.adl.org/resources/hate-symbol/its-okay-be-white",
  adlHonkler: "https://www.adl.org/resources/hate-symbol/honk-honkler",
  ajcReplacement: "https://www.ajc.org/translatehate/great-replacement",
  ajcGlobalist: "https://www.ajc.org/translatehate/globalist",
  isdGlossary: "https://www.isdglobal.org/isd-glossary/",
  isdRemigration:
    "https://www.isdglobal.org/digital-dispatch/total-remigration-anti-migrant-narratives-targeting-the-uk/",
  splcHbd:
    "https://www.splcenter.org/resources/extremist-files/henry-harpending/",
  massJobs:
    "https://www.mass.gov/info-details/recommendations-for-writing-inclusive-job-postings",
  nistHiring: "https://nvlpubs.nist.gov/nistpubs/ir/2021/NIST.IR.8371.pdf",
} as const;

const R = {
  unWomenGender: {
    title: "UN Women — Gender-inclusive language guidelines",
    href: S.unWomenGender,
    supports:
      "recommends gender-neutral collective language and occupational titles instead of male-default forms",
  },
  glaadNonbinary: {
    title: "GLAAD — Nonbinary People",
    href: S.glaadNonbinary,
    supports:
      "supports singular they and language that does not assume only two genders",
  },
  ncdj: {
    title: "National Center on Disability and Journalism — Style Guide",
    href: S.ncdj,
    supports:
      "provides term-specific disability guidance and emphasizes individual/community preference",
  },
  rootedDisability: {
    title: "Rooted in Rights — Disability Writing Guidelines",
    href: S.rootedDisability,
    supports:
      "disability-community-centered guidance on neutral description, agency, and harmful metaphors",
  },
  nabj: {
    title: "National Association of Black Journalists — Style Guide",
    href: S.nabjStyle,
    supports:
      "recommends specific, non-monolithic language for Black communities and racialized reporting",
  },
  transJournalists: {
    title: "Trans Journalists Association — Stylebook and Coverage Guide",
    href: S.transJournalists,
    supports:
      "trans-led guidance on accurate identity, medical, pronoun, and anti-trans rhetoric terminology",
  },
  jrfPoverty: {
    title: "Joseph Rowntree Foundation — Reporting Poverty",
    href: S.jrfPoverty,
    supports:
      "co-produced guidance centering people experiencing poverty, structural causes, and agency",
  },
  aarpAging: {
    title: "AARP — Language of Aging",
    href: S.aarpAging,
    supports:
      "research with adults 50+ supporting non-monolithic, factual language about age",
  },
  massJobs: {
    title: "Massachusetts — Recommendations for Inclusive Job Postings",
    href: S.massJobs,
    supports:
      "recommends clear skills-focused job language instead of exclusionary jargon and archetypes",
  },
} satisfies Record<string, RuleSourceRef>;

/**
 * Broad reading for a topic. These links are never presented as evidence for
 * an individual rule.
 */
const CATEGORY_BACKGROUND: Record<Category, RuleSourceRef[]> = {
  colonial: [
    {
      title: "Indigenous Journalists Association — Terminology Guide",
      href: S.ijaTerminology,
      supports: "accurate, nation-specific reporting about Indigenous peoples",
    },
    {
      title: "Wabanaki Alliance — Media & Style Guide",
      href: S.wabanakiStyle,
      supports: "an Indigenous-led approach to naming, land, history, and expertise",
    },
    {
      title: "ALNAP — Use of language",
      href: S.alnapLanguage,
      supports: "contextual discussion of colonial power and contested global labels",
    },
  ],
  gender: [
    R.unWomenGender,
    R.glaadNonbinary,
  ],
  ableist: [
    R.ncdj,
    R.rootedDisability,
    {
      title: "Autistic Self Advocacy Network — Identity-First Language",
      href: S.asanIdentity,
      supports:
        "community-led context on identity-first language and why preferences vary",
    },
  ],
  racialized: [
    R.nabj,
    {
      title: "Asian American Journalists Association — Style Guide",
      href: "https://www.aajastyleguide.org/",
      supports: "community-specific guidance for accurate reporting on Asian Americans",
    },
  ],
  lgbtq: [
    R.transJournalists,
    { title: "GLAAD — Terms to Avoid", href: S.glaadTerms },
    { title: "interACT — Intersex Media Guide", href: S.interact },
  ],
  class: [
    R.jrfPoverty,
    {
      title: "Street Sense Media — Reporter’s Guide",
      href: S.streetSense,
      supports: "guidance developed for reporting on homelessness with specificity and agency",
    },
  ],
  age: [
    R.aarpAging,
    {
      title: "National Center to Reframe Aging — Communication Best Practices",
      href: S.reframeAging,
      supports: "evidence-based alternatives to burden, crisis, and decline narratives",
    },
  ],
  coded: [
    {
      title: "Institute for Strategic Dialogue — Extremism Glossary",
      href: S.isdGlossary,
      supports:
        "specialist definitions and context for extremist movements, narratives, and coded terms",
    },
    {
      title: "ADL — Hate Symbols Database",
      href: "https://www.adl.org/resources/hate-symbols/search",
      supports:
        "contextual reference for symbols and phrases used by organized hate movements",
    },
  ],
  general: [
    R.massJobs,
    {
      title: "NIST — Workforce Diversity and Inclusion",
      href: S.nistHiring,
      supports: "skills-focused equitable hiring and reduction of subjective culture screening",
    },
  ],
};

/** Rule-specific references. Unlike category background, these are tied to an ID. */
const BY_ID: Partial<Record<string, RuleSourceRef[]>> = {
  "guys-generic": [R.unWomenGender],
  mankind: [R.unWomenGender],
  manpower: [R.unWomenGender],
  "man-hours": [R.unWomenGender],
  "man-made": [R.unWomenGender],
  "he-she": [R.glaadNonbinary, R.unWomenGender],
  "ladies-and-gentlemen": [R.glaadNonbinary],
  "both-genders": [R.glaadNonbinary],
  chairman: [R.unWomenGender],
  policeman: [R.unWomenGender],
  fireman: [R.unWomenGender],
  mailman: [R.unWomenGender],
  salesman: [R.unWomenGender],
  congressman: [R.unWomenGender],
  stewardess: [R.unWomenGender],
  waitress: [R.unWomenGender],
  businessman: [R.unWomenGender],
  freshman: [R.unWomenGender],
  "you-guys": [R.unWomenGender],
  feminazi: [
    {
      title: "APA — Bias-free language: gender",
      href: S.apaGender,
      supports:
        "flags sexist and demeaning gendered language; prefer specific, respectful description",
    },
  ],
  "like-a-girl": [
    {
      title: "APA — Bias-free language: gender",
      href: S.apaGender,
      supports:
        "discourages language that treats gender as a deficit or insult",
    },
  ],
  "man-up": [
    {
      title: "APA — Bias-free language: gender",
      href: S.apaGender,
      supports:
        "discourages language that equates competence or courage with masculinity",
    },
  ],
  "office-wife": [
    {
      title: "APA — Bias-free language: gender",
      href: S.apaGender,
      supports:
        "recommends avoiding gendered stereotypes and demeaning relationship metaphors at work",
    },
  ],
  "bitch-slur": [
    {
      title: "APA — Bias-free language: gender",
      href: S.apaGender,
      supports:
        "flags gendered insults; soft-flagged here so breeding and quoted uses can be kept",
    },
  ],
  bossy: [
    {
      title: "APA — Bias-free language: gender",
      href: S.apaGender,
      supports:
        "supports avoiding gendered double standards in describing leadership and assertiveness",
    },
  ],
  shrill: [
    {
      title: "APA — Bias-free language: gender",
      href: S.apaGender,
      supports:
        "supports avoiding tone-policing language that disproportionately targets women",
    },
  ],
  hysterical: [
    {
      title: "APA — Bias-free language: gender",
      href: S.apaGender,
      supports:
        "supports avoiding historically gendered dismissals of emotion and judgment",
    },
  ],
  "female-role-prefix": [R.unWomenGender],
  "girls-for-adults": [R.unWomenGender],
  "high-maintenance": [
    {
      title: "APA — Bias-free language: gender",
      href: S.apaGender,
      supports:
        "supports avoiding gendered stereotypes when describing people’s needs or requests",
    },
  ],
  girlboss: [
    {
      title: "APA — Bias-free language: gender",
      href: S.apaGender,
      supports:
        "supports describing people’s roles without patronizing gendered marketing labels",
    },
  ],
  "emotional-stereotype": [
    {
      title: "APA — Bias-free language: gender",
      href: S.apaGender,
      supports:
        "flags stereotyping women as overly emotional; prefer specific behavior description",
    },
  ],
  "drama-queen": [
    {
      title: "APA — Bias-free language: gender",
      href: S.apaGender,
      supports:
        "supports avoiding gendered dismissals of someone’s concerns",
    },
  ],
  "gold-digger": [
    {
      title: "APA — Bias-free language: gender",
      href: S.apaGender,
      supports:
        "supports avoiding misogynistic stereotypes about women’s motives",
    },
  ],

  crazy: [R.ncdj, R.rootedDisability],
  lame: [R.ncdj, R.rootedDisability],
  dumb: [R.ncdj, R.rootedDisability],
  "stupid-as-default": [R.rootedDisability],
  "blind-to": [R.ncdj, R.rootedDisability],
  crippled: [R.ncdj],
  "wheelchair-bound": [R.ncdj, R.rootedDisability],
  "suffers-from": [R.ncdj, R.rootedDisability],
  handicap: [R.ncdj],
  "special-needs": [R.ncdj],
  retard: [R.ncdj],
  spaz: [R.ncdj],
  "sanity-check": [R.rootedDisability],
  "ocd-metaphor": [R.ncdj],
  "bipolar-metaphor": [R.ncdj],

  "colored-people": [R.nabj],
  "ghetto-as-slur": [R.nabj],
  "inner-city-coded": [R.nabj],
  thug: [R.nabj],
  uppity: [R.nabj],

  homosexual: [
    {
      title: "GLAAD — Terms to Avoid",
      href: S.glaadTerms,
      supports: "directly recommends against clinical “homosexual” labeling in general media usage",
    },
  ],
  "sexual-preference": [
    {
      title: "GLAAD — Terms to Avoid",
      href: S.glaadTerms,
      supports: "explains why sexual orientation is more accurate than sexual preference",
    },
  ],
  lifestyle: [
    {
      title: "GLAAD — Terms to Avoid",
      href: S.glaadTerms,
      supports: "rejects “gay lifestyle” framing as reductive and inaccurate",
    },
  ],
  "preferred-pronouns": [R.transJournalists],
  transgendered: [R.transJournalists],
  "born-a-sex": [
    R.transJournalists,
    {
      title: "GLAAD — Covering the Transgender Community",
      href: S.glaadTrans,
      supports: "recommends assigned-at-birth terminology when that detail is relevant",
    },
  ],
  "sex-change": [R.transJournalists],
  "transwomen-compound": [R.transJournalists],
  "trans-identified": [R.transJournalists],
  "rapid-onset-gd": [R.transJournalists],
  "social-contagion-trans": [R.transJournalists],
  "trans-agenda": [R.transJournalists],
  "groomer-smear": [R.transJournalists],
  "mutilation-transition": [R.transJournalists],
  hermaphrodite: [
    {
      title: "interACT — Intersex Media Guide",
      href: S.interact,
      supports: "intersex-led guidance on respectful terminology and terms to avoid",
    },
  ],

  "poor-as-insult": [R.jrfPoverty],
  "welfare-queen": [R.jrfPoverty],
  "welfare-dependent": [R.jrfPoverty],
  "poverty-stricken": [R.jrfPoverty],
  underclass: [R.jrfPoverty],
  "the-homeless": [
    {
      title: "Street Sense Media — Reporter’s Guide",
      href: S.streetSense,
      supports: "recommends specificity and asking people how they identify in homelessness coverage",
    },
  ],
  "unskilled-labor": [
    {
      title: "Jobs for the Future — Language Matters Guide",
      href: S.jffLanguage,
      supports: "recommends describing credentials, pay, or role requirements instead of labeling workers unskilled",
    },
  ],
  "low-skilled-workers": [
    {
      title: "Jobs for the Future — Language Matters Guide",
      href: S.jffLanguage,
      supports: "recommends precise descriptions of skills and barriers rather than deficit labels",
    },
  ],

  "elderly-as-burden": [R.aarpAging],
  "old-people": [R.aarpAging],
  "silver-tsunami": [
    {
      title: "National Center to Reframe Aging — Communication Best Practices",
      href: S.reframeAging,
      supports: "recommends against crisis and disaster metaphors for population aging",
    },
  ],
  "digital-native": [
    {
      title: "AARP — Age-Inclusive Employment Guidance",
      href: S.aarpEmployment,
      supports: "challenges age-coded assumptions in hiring and workplace language",
    },
  ],
  "young-energetic": [
    {
      title: "AARP — Age-Inclusive Employment Guidance",
      href: S.aarpEmployment,
      supports: "challenges age-coded assumptions in hiring and workplace language",
    },
  ],

  "ninja-rockstar": [R.massJobs],
  "culture-fit": [
    {
      title: "NIST — Workforce Diversity and Inclusion",
      href: S.nistHiring,
      supports: "supports structured, job-relevant criteria over subjective similarity screening",
    },
  ],
  "minorities-noun": [R.nabj],
  "discover-land": [
    {
      title: "Daedalus — Climate & Language: An Entangled Crisis",
      href: S.climateLanguage,
      supports:
        "documents how “discovery,” terra nullius, and colonial renaming render Indigenous presence invisible",
    },
    {
      title: "Indigenous Journalists Association — Terminology Guide",
      href: S.ijaTerminology,
      supports:
        "recommends specific nation/community names and rigorous phrasing in coverage of Indigenous peoples",
    },
  ],
  "new-world": [
    {
      title: "American Journal of Biological Anthropology — Words matter in primatology",
      href: S.oldNewWorldStudy,
      supports:
        "examines Old World/New World terminology as colonial framing that can erase Indigenous history",
    },
  ],
  "old-world": [
    {
      title: "American Journal of Biological Anthropology — Words matter in primatology",
      href: S.oldNewWorldStudy,
      supports:
        "examines Old World/New World terminology as colonial framing that can erase Indigenous history",
    },
  ],
  "third-world": [
    {
      title: "Scotland’s International Development Alliance — Inclusive Language Guide",
      href: S.sidaInclusive,
      supports:
        "identifies first/third world and developing/developed language as hierarchical and tied to exploitative relations",
    },
    {
      title: "MSF Anti-Racism Project — Equitable and Inclusive Language",
      href: S.msfEquitable,
      supports:
        "recommends specificity and warns that developing world, Global South, and third world can be reductive",
    },
    {
      title: "ALNAP — Global South/North and first/third world",
      href: S.alnapLanguage,
      role: "contested",
      supports:
        "explains when relational power terms can be useful and when they become reductive binaries",
    },
  ],
  "first-world": [
    {
      title: "Scotland’s International Development Alliance — Inclusive Language Guide",
      href: S.sidaInclusive,
      supports:
        "identifies first/third world and developing/developed language as hierarchical and tied to exploitative relations",
    },
    {
      title: "ALNAP — Global South/North and first/third world",
      href: S.alnapLanguage,
      role: "contested",
      supports:
        "explains when relational power terms can be useful and when they become reductive binaries",
    },
  ],
  "developing-country": [
    {
      title: "Scotland’s International Development Alliance — Inclusive Language Guide",
      href: S.sidaInclusive,
      supports:
        "recommends place-specific language and treats developing/developed framing as hierarchical",
    },
    {
      title: "MSF Anti-Racism Project — Equitable and Inclusive Language",
      href: S.msfEquitable,
      supports:
        "recommends naming countries or the exact material measure instead of broad development labels",
    },
    {
      title: "ALNAP — Use of language",
      href: S.alnapLanguage,
      role: "contested",
      supports:
        "documents debate around Global South/North while retaining colonial exploitation as relevant context",
    },
  ],
  underdeveloped: [
    {
      title: "Scotland’s International Development Alliance — Inclusive Language Guide",
      href: S.sidaInclusive,
      supports:
        "rejects hierarchical development language and recommends place- and context-specific descriptions",
    },
  ],
  civilized: [
    {
      title: "Survival International — Proud, not primitive",
      href: S.survivalRespect,
      supports:
        "connects civilized/primitive hierarchies to forced development and persecution of Indigenous peoples",
    },
  ],
  uncivilized: [
    {
      title: "Survival International — Proud, not primitive",
      href: S.survivalRespect,
      supports:
        "connects civilized/primitive hierarchies to forced development and persecution of Indigenous peoples",
    },
  ],
  primitive: [
    {
      title: "Survival International — Proud, not primitive",
      href: S.survivalRespect,
      supports:
        "states that primitive, backward, savage, and stone-age labels are false, discriminatory, and dangerous",
    },
  ],
  savage: [
    {
      title: "Survival International — Proud, not primitive",
      href: S.survivalRespect,
      supports:
        "states that primitive, backward, savage, and stone-age labels are false, discriminatory, and dangerous",
    },
  ],
  "tribe-generic": [
    {
      title: "Native Governance Center — How to Talk About Native Nations",
      href: S.nativeGovernance,
      supports:
        "recommends nation to recognize sovereignty while retaining Tribe for official names, law, or community preference",
    },
    {
      title: "Indigenous Journalists Association — Terminology Guide",
      href: S.ijaTerminology,
      supports:
        "recommends identifying the specific tribe, nation, or community rather than a catch-all group",
    },
    {
      title: "Wabanaki Alliance — Media & Style Guide",
      href: S.wabanakiStyle,
      supports:
        "centers distinct Indigenous governments, identities, histories, and community-preferred names",
    },
  ],
  exotic: [
    {
      title: "Asian American Journalists Association — Guide to Covering Asian America",
      href: S.aajaCoverage,
      supports:
        "explains that exotic positions Asian people against a white norm and recommends specific description",
    },
  ],
  "pow-wow-metaphor": [
    {
      title: "Indigenous Corporate Training — Indigenous Powwow Protocol",
      href: S.ictPowwow,
      supports:
        "explains what a powwow is and directly says colloquial use for any meeting is disrespectful",
    },
  ],
  "spirit-animal": [
    {
      title: "Smithsonian Native Knowledge 360° — Not Your Spirit Animal",
      href: S.smithsonianSpirit,
      supports:
        "explains that generic spirit-animal activities trivialize nation-specific relationships, kinship, and beliefs",
    },
  ],
  "totem-pole": [
    {
      title: "Indigenous Corporate Training — Culturally Offensive Phrases",
      href: S.ictOffensivePhrases,
      supports:
        "explains the cultural meaning of poles and why hierarchy metaphors misrepresent them",
    },
  ],
  eskimo: [
    {
      title: "Inuit Circumpolar Council — Resolution on the use of the term Inuit",
      href: S.iccInuit,
      supports:
        "an Inuit-led resolution calling on research and other communities to use Inuit instead of Eskimo",
    },
  ],
  "oriental-people": [
    {
      title: "APA Style — Racial and ethnic identity",
      href: S.apaRace,
      supports:
        "recommends specific identity terms and treats Oriental as inappropriate for people",
    },
  ],
  "master-slave": [
    {
      title: "GitHub — Renaming default branch from master",
      href: S.githubMain,
      role: "contested",
      supports:
        "documents one major platform’s move from master to main; it does not by itself prove every technical master/slave usage has the same context",
    },
  ],
  "master-branch": [
    {
      title: "GitHub — Renaming default branch from master",
      href: S.githubMain,
      supports:
        "documents GitHub’s default-branch change and recommends main for new repositories",
    },
  ],
  grandfathered: [
    {
      title: "DC Office of Human Rights — Words Matter",
      href: S.dcWords,
      supports:
        "provides historical context for grandfather clause and recommends precise alternatives such as legacy status",
    },
  ],
  "illegal-alien": [
    {
      title: "AP — ‘Illegal immigrant’ no more",
      href: S.apIllegal,
      supports:
        "recommends describing a person’s action or legal circumstances instead of labeling the person illegal",
    },
  ],
  "native-speaker-only": [
    {
      title: "TESOL — Position Against Discrimination of Nonnative Speakers",
      href: S.tesolNonnative,
      supports:
        "rejects native/non-native hiring criteria and recommends evaluating proficiency, preparation, and experience",
    },
    {
      title: "Ruanni Tupas — The coloniality of native speakerism",
      href: S.nativeSpeakerColoniality,
      supports:
        "traces native-speaker hierarchy to racialized colonial power and deficit language beliefs",
    },
  ],
  "mother-tongue-gate": [
    {
      title: "TESOL — Position Against Discrimination of Nonnative Speakers",
      href: S.tesolNonnative,
      supports:
        "opposes using native-speaker identity as an employment proxy instead of demonstrated proficiency",
    },
    {
      title: "Ruanni Tupas — The coloniality of native speakerism",
      href: S.nativeSpeakerColoniality,
      supports:
        "traces native-speaker hierarchy to racialized colonial power and deficit language beliefs",
    },
  ],
  guru: [
    {
      title: "Sikh Coalition — Teaching About Sikhism",
      href: S.sikhGuru,
      role: "contested",
      supports:
        "explains Guru as a deeply significant Sikh title and source of spiritual authority",
    },
    {
      title: "Hindu American Foundation — Respecting the wisdom gurus pass on",
      href: S.hinduGuru,
      role: "contested",
      supports:
        "describes sacred guru-disciple relationships while showing that Indic usage can extend to master teachers",
    },
  ],
  "circle-the-wagons": [
    {
      title: "American Indians in Children’s Literature — Problematic Phrases",
      href: S.aiclPhrases,
      supports:
        "explains how the idiom reproduces settler stories of Indigenous people as aggressors",
    },
  ],
  "indian-giver": [
    {
      title: "ICT News — History of the term “Indian giver”",
      href: S.ictIndianGiver,
      supports:
        "documents the term’s derogatory history and European misreading of Indigenous exchange",
    },
  ],
  "virgin-land": [
    {
      title: "Daedalus — Climate & Language: An Entangled Crisis",
      href: S.climateLanguage,
      supports:
        "links virgin-land and terra-nullius language to imagined emptiness and Indigenous erasure",
    },
  ],
  "dark-continent": [
    {
      title: "Lucy Jarosz — Constructing the Dark Continent",
      href: S.darkContinentStudy,
      supports:
        "documents the metaphor as an othering representation that reaffirms Western dominance",
    },
  ],
  "colonize-metaphor": [
    {
      title: "Tuck & Yang — Decolonization is not a metaphor",
      href: S.decolonizationNotMetaphor,
      role: "contested",
      supports:
        "directly critiques metaphorical decolonization; relevant background, but not proof that every casual use of colonize is harmful",
    },
  ],
  "cultural-marxism": [
    {
      title: "SPLC — ‘Cultural Marxism’ catching on",
      href: S.splcCulturalMarxism,
      supports:
        "documents the phrase’s antisemitic conspiracy lineage and use in far-right organizing",
    },
  ],
  "great-replacement": [
    {
      title: "American Jewish Committee — Great Replacement",
      href: S.ajcReplacement,
      supports:
        "documents the white-supremacist conspiracy theory and its antisemitic variants",
    },
  ],
  "blood-and-soil": [
    {
      title: "ADL — German Nazi phrases",
      href: S.adlGerman,
      supports: "identifies Blood and Soil as a Nazi slogan adopted by white supremacists",
    },
  ],
  "echo-parentheses": [
    {
      title: "ADL — Echo",
      href: S.adlEcho,
      supports: "identifies triple parentheses as an antisemitic targeting marker",
    },
  ],
  "fourteen-eighty-eight": [
    {
      title: "ADL — 1488",
      href: S.adl1488,
      supports: "documents 14/88 and 1488 as combined white-supremacist numerical symbols",
    },
  ],
  "globalist-smear": [
    {
      title: "American Jewish Committee — Globalist",
      href: S.ajcGlobalist,
      role: "contested",
      supports:
        "explains antisemitic uses while warning that the ordinary political term is not inherently antisemitic",
    },
  ],
  "shemale-slur": [
    {
      title: "Trans Journalists Association — Stylebook and Coverage Guide",
      href: S.transJournalists,
      supports: "identifies the term as a dehumanizing slur and gives accurate alternatives",
    },
  ],
  "white-genocide": [
    {
      title: "American Jewish Committee — Great Replacement",
      href: S.ajcReplacement,
      supports:
        "documents white genocide as a variant of the white-supremacist replacement conspiracy",
    },
  ],
  "race-realism": [
    {
      title: "SPLC — Henry Harpending and Human Biodiversity",
      href: S.splcHbd,
      supports:
        "documents Human Biodiversity and race realism as labels used to rehabilitate scientific racism",
    },
  ],
  iotbw: [
    {
      title: "ADL — It’s Okay to Be White",
      href: S.adlIotbw,
      supports:
        "documents the slogan’s origin as a trolling campaign and subsequent white-supremacist use",
    },
  ],
  remigration: [
    {
      title: "Institute for Strategic Dialogue — Total Remigration",
      href: S.isdRemigration,
      supports:
        "documents remigration as an extreme-right mass-deportation narrative and campaign",
    },
  ],
  "clown-world": [
    {
      title: "ADL — Honkler",
      href: S.adlHonkler,
      supports:
        "documents the clown-world/Honkler meme’s adoption in white-supremacist and antisemitic communities",
    },
  ],
};

export function ruleSourceMappingIds(): string[] {
  return Object.keys(BY_ID);
}

export interface RuleSourceContext {
  evidence: RuleSourceRef[];
  contested: RuleSourceRef[];
  background: RuleSourceRef[];
  hasDirectEvidence: boolean;
}

function withRole(
  source: RuleSourceRef,
  role: RuleSourceRole,
): RuleSourceRef {
  return { ...source, role: source.role ?? role };
}

/**
 * Rule-specific references only. Category background is deliberately excluded
 * so a broad homepage can never masquerade as evidence for a particular rule.
 */
export function sourcesForRule(rule: LanguageRule): RuleSourceRef[] {
  if (rule.sources) return rule.sources;
  return sourcesForRuleId(rule.id, rule.category);
}

export function sourcesForRuleId(
  ruleId: string,
  category: Category,
): RuleSourceRef[] {
  void category;
  return BY_ID[ruleId] ?? [];
}

export function backgroundSourcesForCategory(
  category: Category,
): RuleSourceRef[] {
  return CATEGORY_BACKGROUND[category].map((source) =>
    withRole(source, "background"),
  );
}

export function sourceContextForRule(rule: LanguageRule): RuleSourceContext {
  const specific = rule.sources ?? BY_ID[rule.id] ?? [];
  return buildSourceContext(specific, rule.category);
}

export function sourceContextForRuleId(
  ruleId: string,
  category: Category,
): RuleSourceContext {
  return buildSourceContext(BY_ID[ruleId] ?? [], category);
}

function buildSourceContext(
  specific: RuleSourceRef[],
  category: Category,
): RuleSourceContext {
  const evidence = specific
    .filter((source) => source.role !== "contested")
    .map((source) => withRole(source, "evidence"));
  const contested = specific
    .filter((source) => source.role === "contested")
    .map((source) => withRole(source, "contested"));
  return {
    evidence,
    contested,
    background: backgroundSourcesForCategory(category),
    hasDirectEvidence: evidence.length > 0,
  };
}

/** Short badge label for Swap / cards (APA, GLAAD, NCDJ…). */
export function compactSourceName(title: string): string {
  if (/\bAPA\b/i.test(title)) return "APA";
  if (/\bGLAAD\b/i.test(title)) return "GLAAD";
  if (/\bNCDJ\b/i.test(title)) return "NCDJ";
  if (/\bCDC\b/i.test(title)) return "CDC";
  if (/United Nations|\bUN\b/i.test(title)) return "UN";
  if (/Conscious Style Guide/i.test(title)) return "Conscious Style Guide";
  if (/\bGitHub\b/i.test(title)) return "GitHub";
  if (/Associated Press|\bAP\b —/i.test(title)) return "AP";
  if (/Native American Journalists|\bNAJA\b/i.test(title)) return "NAJA";
  if (/World Bank/i.test(title)) return "World Bank";
  if (/\bADL\b/i.test(title)) return "ADL";
  if (/\bSPLC\b/i.test(title)) return "SPLC";
  if (/RationalWiki/i.test(title)) return "RationalWiki";
  if (/Indiecator/i.test(title)) return "Indiecator";
  if (/Conspiracy Chart/i.test(title)) return "Conspiracy Chart";
  return title.replace(/\s*[—–-].*$/, "").trim().slice(0, 42);
}
