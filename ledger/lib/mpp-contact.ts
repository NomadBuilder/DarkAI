export type MppContactVariant =
  | 'default'
  | 'water'
  | 'healthcare'
  | 'publicCare'
  | 'bill5'
  | 'greenbelt'
  | 'publicLand'
  | 'indigenous'
  | 'foi'
  | 'bikeLanes'

export type MppIssueOption = {
  id: MppContactVariant
  label: string
  shortLabel: string
  description: string
}

export const MPP_ISSUE_OPTIONS: MppIssueOption[] = [
  {
    id: 'healthcare',
    label: 'Healthcare & hospitals',
    shortLabel: 'Healthcare',
    description: 'Agency spending, ER waits, and for-profit clinics',
  },
  {
    id: 'publicCare',
    label: 'Public care & care economy',
    shortLabel: 'Public care',
    description: 'Bill 124, unpaid caregiving, and feminized care work',
  },
  {
    id: 'water',
    label: 'Water & public services',
    shortLabel: 'Water',
    description: 'Bill 60 and corporate control of water systems',
  },
  {
    id: 'publicLand',
    label: 'Public land & waterfront',
    shortLabel: 'Public land',
    description: 'Greenbelt, Ontario Place, and developer access',
  },
  {
    id: 'bill5',
    label: 'Wildlife & Bill 5',
    shortLabel: 'Bill 5',
    description: 'Species protection and special economic zones',
  },
  {
    id: 'indigenous',
    label: 'Indigenous rights',
    shortLabel: 'Indigenous rights',
    description: 'Treaty rights, FPIC, and Ring of Fire',
  },
  {
    id: 'foi',
    label: 'Transparency & FOI',
    shortLabel: 'FOI',
    description: 'Freedom-of-information rollbacks and closed-door deals',
  },
  {
    id: 'bikeLanes',
    label: 'Street safety & bike lanes',
    shortLabel: 'Bike lanes',
    description: 'Bills 212, 56, and 60 — safety cuts and lawsuit shields',
  },
  {
    id: 'default',
    label: 'General accountability',
    shortLabel: 'Accountability',
    description: 'Public capacity, privatization, and for-profit drift',
  },
]

const messages: Record<MppContactVariant, string> = {
  default: `I'm concerned about the long-term impact of relying more heavily on for-profit providers in publicly funded systems.

Once public capacity is reduced, it can be difficult and costly to rebuild. I'd like to understand how these risks are being weighed in current policy decisions.

Thank you for considering this perspective.

Best regards,`,

  water: `I'm concerned about Bill 60's Water and Wastewater Public Corporations Act, 2025, and its potential to enable water privatization in Ontario.

This legislation allows corporations structured like private companies to take control of water services, with the power to set rates and operate outside public accountability frameworks. Once water systems are transferred to corporations, returning to public control becomes extremely difficult and costly.

Water is a human right, not a corporate commodity. I'd like to understand how the government plans to ensure water remains affordable and publicly accountable under this legislation.

Thank you for considering this perspective.

Best regards,`,

  healthcare: `I'm concerned about the dramatic growth of private spending in Ontario's healthcare system, particularly the $9.2 billion paid to private staffing agencies over 10 years and the expansion of for-profit surgical clinics under Bill 60.

Private agency staff cost far more per hour than equivalent public employees, while hospitals report deficits and staffing gaps. Ontario ranks poorly on per-capita acute care beds compared to other provinces.

Once public capacity is reduced, it can be difficult and costly to rebuild. I'd like to understand how the government plans to stabilize public hospitals and reduce reliance on expensive private providers.

Thank you for considering this perspective.

Best regards,`,

  publicCare: `I'm concerned about how cuts to public care land unevenly — on feminized health and education jobs, and on unpaid family caregivers at home.

Bill 124 capped wages for many broader-public-sector workers while hospitals spent billions on private staffing agencies. About nine in ten registered nurses in Canada are women. When ER waits grow, home-care waitlists stretch, and school supports shrink, families absorb the gap — disproportionately women in multigenerational and single-parent households.

Public services are how we share care. I'm asking you to reinvest in public hospitals, home care, and school supports — and to remedy the harm Bill 124 caused to health and education workers.

Thank you for considering this perspective.

Best regards,`,

  bill5: `I'm concerned about Bill 5, the Protect Ontario by Unleashing our Economy Act, 2025.

Bill 5 replaces the Endangered Species Act with a weaker Species Conservation Act and creates "special economic zones" where trusted proponents and designated projects can be exempt from provincial and municipal regulations. The first such zone has been declared in the Ring of Fire, raising serious concerns about Indigenous rights and free, prior and informed consent.

I'm asking you to support repealing Bill 5 and to protect species at risk and Indigenous rights. Healthy ecosystems and respect for treaty rights should not be sacrificed for unchecked development.

Thank you for considering this perspective.

Best regards,`,

  greenbelt: `I'm concerned about how the provincial government treats public land in Ontario—from the Greenbelt land swap (now under RCMP criminal investigation) to the 95-year private lease for a thermal spa at publicly owned Ontario Place.

The Auditor General found the Greenbelt removal process was "biased and lacked transparency," with developers lobbying for 12 of 15 sites before the decision. Public pressure forced a reversal, but the probe continues—and Ontario Place is moving ahead with less Environmental Bill of Rights scrutiny under Bill 5.

I'm asking you to support transparency, accountability, permanent protection for the Greenbelt, and full public participation before locking in long-term deals on our waterfront and protected lands.

Thank you for considering this perspective.

Best regards,`,

  publicLand: `I'm concerned about how the provincial government treats public land in Ontario—from the Greenbelt land swap (now under RCMP criminal investigation) to the 95-year private lease for a thermal spa at publicly owned Ontario Place.

The Auditor General found the Greenbelt removal process was "biased and lacked transparency," with developers lobbying for 12 of 15 sites before the decision. Public pressure forced a reversal, but the probe continues—and Ontario Place is moving ahead with less Environmental Bill of Rights scrutiny under Bill 5.

I'm asking you to support transparency, accountability, permanent protection for the Greenbelt, and full public participation before locking in long-term deals on our waterfront and protected lands.

Thank you for considering this perspective.

Best regards,`,

  indigenous: `I'm concerned about provincial policies that undermine Indigenous and First Nations rights in Ontario.

Bill 5 creates "special economic zones" where projects can be exempt from normal environmental and municipal rules. The first zone was declared in the Ring of Fire—on Treaty 9 territory—without free, prior and informed consent from affected First Nations. The bill also weakens accountability and speeds mining approvals while limiting remedies for communities harmed by these decisions.

Ontario has committed to implementing the UN Declaration on the Rights of Indigenous Peoples. I'm asking you to honour that commitment: repeal Bill 5, halt special economic zones imposed without consent, and ensure Indigenous nations are equal partners—not afterthoughts—in decisions about land, water, and development.

Thank you for considering this perspective.

Best regards,`,

  foi: `I'm concerned about rollbacks to freedom-of-information access and ministerial accountability in Ontario.

Bill 97 exempted ministerial offices from FIPPA coverage retroactively to 1988 — after years of debates over Greenbelt, Ontario Place, and healthcare privatization. When public records are harder to obtain, closed-door deals become easier and accountability weakens.

I'm asking you to restore full FIPPA coverage for ministerial offices, support proactive disclosure of contracts and lobbying contacts, and reject further erosion of Ontarians' right to know how public decisions are made.

Thank you for considering this perspective.

Best regards,`,

  bikeLanes: `I'm concerned about provincial legislation that removes proven street-safety tools and shields the government from accountability when people are harmed.

Bill 212 required removal of protected bike lanes on major Toronto streets and added lawsuit-immunity clauses. Bill 56 ended municipal automated speed enforcement in school zones province-wide. Bill 60 restricts how other cities can build safe separated bike infrastructure.

A Superior Court judge found targeted Toronto bike-lane removals arbitrary and harmful to cyclists. I'm asking you to stop overriding municipal safety policy, restore evidence-based enforcement, and withdraw lawsuit-shield provisions that signal the government expects harm.

Thank you for considering this perspective.

Best regards,`,
}

const subjects: Record<MppContactVariant, string> = {
  default: 'Concern about public capacity and for-profit providers',
  water: 'Concern about Bill 60 and water privatization',
  healthcare: 'Concern about healthcare privatization and hospital funding',
  publicCare: 'Public care is shared care — Bill 124 and caregiving at home',
  bill5: 'Repeal Bill 5 — protect endangered species and Indigenous rights',
  greenbelt: 'Public land — Greenbelt accountability and Ontario Place scrutiny',
  publicLand: 'Public land — Greenbelt accountability and Ontario Place scrutiny',
  indigenous: 'Indigenous rights — repeal Bill 5 and respect free, prior and informed consent',
  foi: 'Restore FOI access — ministerial records and public accountability',
  bikeLanes: 'Street safety — bike lanes, speed cameras, and accountability',
}

export function getMppMessageBody(variant: MppContactVariant): string {
  return messages[variant] ?? messages.default
}

export function getMppEmailSubject(variant: MppContactVariant): string {
  return subjects[variant] ?? subjects.default
}

export type ExternalPetition = {
  label: string
  href: string
  blurb?: string
}

export const CARE_ECONOMY_PETITIONS: ExternalPetition[] = [
  {
    label: 'Ontario Health Coalition — defend public hospitals',
    href: 'https://www.ontariohealthcoalition.ca/',
    blurb: 'Campaigns, rallies, and petitions on healthcare privatization and hospital funding.',
  },
  {
    label: 'Canadian Centre for Policy Alternatives — Ontario',
    href: 'https://www.policyalternatives.ca/offices/ontario',
    blurb: 'Research and advocacy on the care economy, public services, and agency spending.',
  },
  {
    label: 'Broadbent Institute — care economy',
    href: 'https://broadbent.ca/category/care-economy/',
    blurb: 'Policy work on unpaid care, childcare, and gendered labour.',
  },
  {
    label: 'CUPE Ontario — public sector workers',
    href: 'https://cupe.on.ca/',
    blurb: 'Union representing many health, education, and municipal workers affected by Bill 124.',
  },
  {
    label: 'OFL Ford Tracker',
    href: 'https://ofl.ca/ford-tracker/',
    blurb: 'Labour-led tracker of provincial policy impacts on workers and communities.',
  },
]

export const ENVIRONMENT_PETITIONS: ExternalPetition[] = [
  {
    label: 'Ontario Nature: Bill 5 — A moment to mobilize',
    href: 'https://ontarionature.org/bill-5-a-moment-to-mobilize-for-nature-in-ontario-blog/',
  },
  {
    label: 'David Suzuki Foundation: Repeal Bill 5',
    href: 'https://davidsuzuki.org/action/repealbill5/',
  },
  {
    label: 'Animal Alliance of Canada: Bill 75 & dogs and cats in research',
    href: 'https://www.animalalliance.ca/ontarios-bill-75-passed-without-amendments-what-happens-next-for-dogs-and-cats-in-research/',
  },
]
