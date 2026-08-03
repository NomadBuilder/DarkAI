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
};

/**
 * Sources for a rule: explicit rule.sources, else id map, else category defaults.
 */
export function sourcesForRule(rule: LanguageRule): RuleSourceRef[] {
  if (rule.sources && rule.sources.length > 0) return rule.sources;
  const specific = BY_ID[rule.id];
  if (specific) return specific;
  return CATEGORY_DEFAULTS[rule.category];
}
