import type { Category, LanguageRule, RuleSourceRef } from "./types";

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
  worldBank:
    "https://blogs.worldbank.org/en/opendata/new-world-bank-country-classifications-income-level",
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
} as const;

const CATEGORY_DEFAULTS: Record<Category, RuleSourceRef[]> = {
  colonial: [
    { title: "Conscious Style Guide — Indigenous & colonial language", href: S.csg },
    { title: "Native American Journalists Association", href: S.naja },
  ],
  gender: [
    { title: "APA Style — Bias-free language (gender)", href: S.apaGender },
    { title: "UN — Gender-inclusive language", href: S.unGender },
  ],
  ableist: [
    { title: "NCDJ Style Guide", href: S.ncdj },
    { title: "CDC — Communicating about disability", href: S.cdcDisability },
  ],
  racialized: [
    { title: "APA Style — Racial and ethnic identity", href: S.apaRace },
    { title: "Conscious Style Guide", href: S.csg },
  ],
  lgbtq: [
    { title: "GLAAD Media Reference Guide", href: S.glaad },
    { title: "APA Style — Sexual orientation", href: S.apaOrientation },
  ],
  class: [{ title: "Conscious Style Guide — workplace & bias", href: S.csg }],
  age: [{ title: "APA Style — Age", href: S.apaAge }],
  coded: [
    {
      title: "Indiecator — The language of extremism (dogwhistles)",
      href: S.indiecatorDogwhistles,
    },
    {
      title: "RationalWiki — Alt-right glossary",
      href: S.rationalWikiAltRight,
    },
  ],
  general: [{ title: "Conscious Style Guide", href: S.csg }],
};

/** Rule-specific footnotes (override / supplement category defaults). */
const BY_ID: Partial<Record<string, RuleSourceRef[]>> = {
  "discover-land": [
    { title: "Conscious Style Guide — discovery framing", href: S.csg },
    { title: "Native American Journalists Association", href: S.naja },
  ],
  "new-world": [
    { title: "Conscious Style Guide — colonial language", href: S.csg },
  ],
  "third-world": [
    {
      title: "World Bank — income classifications (vs “Third World”)",
      href: S.worldBank,
    },
  ],
  "first-world": [
    {
      title: "World Bank — income classifications",
      href: S.worldBank,
    },
  ],
  "developing-country": [
    {
      title: "World Bank — country classifications by income",
      href: S.worldBank,
    },
  ],
  "pow-wow-metaphor": [
    { title: "NAJA — Indigenous naming & accuracy", href: S.naja },
    { title: "Conscious Style Guide", href: S.csg },
  ],
  "spirit-animal": [
    { title: "Conscious Style Guide — appropriation metaphors", href: S.csg },
  ],
  "totem-pole": [
    { title: "Conscious Style Guide — appropriation metaphors", href: S.csg },
  ],
  eskimo: [
    { title: "APA Style — Racial and ethnic identity", href: S.apaRace },
    { title: "NAJA resources", href: S.naja },
  ],
  "oriental-people": [
    { title: "APA Style — Racial and ethnic identity", href: S.apaRace },
  ],
  "master-slave": [
    { title: "GitHub — Renaming default branch from master", href: S.githubMain },
    { title: "Conscious Style Guide — tech metaphors", href: S.csg },
  ],
  "master-branch": [
    { title: "GitHub — Renaming default branch from master", href: S.githubMain },
  ],
  "whitelist-blacklist": [
    { title: "Conscious Style Guide — whitelist/blacklist", href: S.csg },
  ],
  grandfathered: [
    { title: "Conscious Style Guide", href: S.csg },
  ],
  "illegal-alien": [
    {
      title: "AP — ‘Illegal immigrant’ no more",
      href: S.apIllegal,
    },
  ],
  "native-speaker-only": [
    { title: "Conscious Style Guide — workplace & bias", href: S.csg },
  ],
  "cultural-marxism": [
    {
      title: "SPLC — ‘Cultural Marxism’ catching on",
      href: S.splcCulturalMarxism,
    },
    {
      title: "RationalWiki — Alt-right glossary",
      href: S.rationalWikiAltRight,
    },
    { title: "Conspiracy Chart", href: S.conspiracyChart },
  ],
  "great-replacement": [
    {
      title: "ADL — Great Replacement explainer",
      href: S.adlGreatReplacement,
    },
    { title: "Conspiracy Chart", href: S.conspiracyChart },
  ],
  "blood-and-soil": [
    {
      title: "Indiecator — dogwhistles (Blood and soil)",
      href: S.indiecatorDogwhistles,
    },
    {
      title: "RationalWiki — Alt-right glossary",
      href: S.rationalWikiAltRight,
    },
  ],
  "echo-parentheses": [
    {
      title: "Indiecator — (((echo))) markers",
      href: S.indiecatorDogwhistles,
    },
    {
      title: "RationalWiki — Alt-right glossary",
      href: S.rationalWikiAltRight,
    },
  ],
  "fourteen-eighty-eight": [
    {
      title: "Indiecator — 14 / 88 numerical codes",
      href: S.indiecatorDogwhistles,
    },
    {
      title: "RationalWiki — Alt-right glossary",
      href: S.rationalWikiAltRight,
    },
  ],
  "globalist-smear": [
    {
      title: "Indiecator — globalist & Cultural Marxism",
      href: S.indiecatorDogwhistles,
    },
    {
      title: "RationalWiki — Alt-right glossary",
      href: S.rationalWikiAltRight,
    },
  ],
  "western-values-dogwhistle": [
    {
      title: "Indiecator — Western values / culture",
      href: S.indiecatorDogwhistles,
    },
  ],
  "trans-agenda": [
    { title: "GLAAD Media Reference Guide", href: S.glaad },
    { title: "Conspiracy Chart", href: S.conspiracyChart },
  ],
  "groomer-smear": [
    { title: "GLAAD Media Reference Guide", href: S.glaad },
    {
      title: "RationalWiki — Alt-right glossary",
      href: S.rationalWikiAltRight,
    },
  ],
  "go-woke-go-broke": [
    {
      title: "RationalWiki — Alt-right glossary",
      href: S.rationalWikiAltRight,
    },
    {
      title: "Antifascists of Reddit — dogwhistle glossary",
      href: S.redditDogwhistleGlossary,
    },
  ],
  "modern-audience": [
    {
      title: "Indiecator — anti-woke / gaming dogwhistles",
      href: S.indiecatorDogwhistles,
    },
  ],
  "white-genocide": [
    {
      title: "ADL — Great Replacement explainer",
      href: S.adlGreatReplacement,
    },
    {
      title: "RationalWiki — Alt-right glossary",
      href: S.rationalWikiAltRight,
    },
  ],
  "race-realism": [
    {
      title: "RationalWiki — Alt-right glossary",
      href: S.rationalWikiAltRight,
    },
    {
      title: "SPLC — ‘Cultural Marxism’ catching on",
      href: S.splcCulturalMarxism,
    },
  ],
  iotbw: [
    {
      title: "RationalWiki — Alt-right glossary",
      href: S.rationalWikiAltRight,
    },
    {
      title: "Antifascists of Reddit — dogwhistle glossary",
      href: S.redditDogwhistleGlossary,
    },
  ],
  remigration: [
    {
      title: "RationalWiki — Alt-right glossary",
      href: S.rationalWikiAltRight,
    },
    {
      title: "Indiecator — dogwhistles",
      href: S.indiecatorDogwhistles,
    },
  ],
  "soy-boy": [
    { title: "Conspiracy Chart", href: S.conspiracyChart },
    {
      title: "RationalWiki — Alt-right glossary",
      href: S.rationalWikiAltRight,
    },
  ],
  "kalergi-plan": [
    {
      title: "ADL — Great Replacement explainer",
      href: S.adlGreatReplacement,
    },
    {
      title: "RationalWiki — Alt-right glossary",
      href: S.rationalWikiAltRight,
    },
  ],
  "clown-world": [
    {
      title: "RationalWiki — Alt-right glossary",
      href: S.rationalWikiAltRight,
    },
    {
      title: "Antifascists of Reddit — dogwhistle glossary",
      href: S.redditDogwhistleGlossary,
    },
  ],
};

/**
 * Sources for a rule: explicit rule.sources, else id map, else category defaults.
 */
export function sourcesForRule(rule: LanguageRule): RuleSourceRef[] {
  if (rule.sources && rule.sources.length > 0) return rule.sources;
  return sourcesForRuleId(rule.id, rule.category);
}

export function sourcesForRuleId(
  ruleId: string,
  category: Category,
): RuleSourceRef[] {
  const specific = BY_ID[ruleId];
  if (specific) return specific;
  return CATEGORY_DEFAULTS[category];
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
