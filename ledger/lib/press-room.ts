export type ExpertContact = {
  topic: string
  organization: string
  href: string
  note: string
}

export type PressDownload = {
  label: string
  href: string
  description: string
  sizeHint?: string
}

export type PressQuote = {
  text: string
  attribution: string
  sourceUrl?: string
}

export const PRESS_EXPERT_ROUTING: ExpertContact[] = [
  {
    topic: 'Healthcare privatization & hospital funding',
    organization: 'Ontario Health Coalition',
    href: 'https://www.ontariohealthcoalition.ca/',
    note: 'Campaigns, rallies, and expert commentary on for-profit clinics and agency spending.',
  },
  {
    topic: 'Care economy & public services',
    organization: 'Canadian Centre for Policy Alternatives — Ontario',
    href: 'https://www.policyalternatives.ca/offices/ontario',
    note: 'Research on staffing agencies, Bill 124, and public-sector funding.',
  },
  {
    topic: 'Environment, Bill 5 & species protection',
    organization: 'Ontario Nature',
    href: 'https://ontarionature.org/',
    note: 'Bill 5 mobilization and environmental policy analysis.',
  },
  {
    topic: 'Indigenous rights & Ring of Fire',
    organization: 'Contact indigenous-led campaigns directly',
    href: '/indigenous-rights',
    note: 'Follow and amplify statements from affected First Nations — see our Indigenous rights page for context.',
  },
  {
    topic: 'Public Accounts & vendor payments data',
    organization: 'ProtectOnt / The Receipts',
    href: '/receipts',
    note: 'Ontario Public Accounts vendor data, methodology, and source links. General media: About page contact form.',
  },
  {
    topic: 'Democracy, FOI & accountability',
    organization: 'Democracy Watch',
    href: 'https://democracywatch.ca/',
    note: 'Transparency, lobbying, and government accountability.',
  },
  {
    topic: 'Labour & workers affected by Bill 124',
    organization: 'CUPE Ontario / OFL',
    href: 'https://cupe.on.ca/',
    note: 'Representing many health, education, and municipal workers.',
  },
]

export const PRESS_DOWNLOADS: PressDownload[] = [
  {
    label: 'Budget day / scandal drop pack (ZIP)',
    href: '/downloads/media/budget-day-press-pack.zip',
    description:
      '3 chart PNGs, 2 ready-to-quote lines, scandal timeline, sample vendor receipt, methodology one-pager.',
    sizeHint: '~500 KB',
  },
  {
    label: 'B-roll & chart pack (ZIP)',
    href: '/downloads/media/broll-chart-pack.zip',
    description: 'Chart assets, logos, og-image, and creator README for social and broadcast use.',
    sizeHint: '~1 MB',
  },
  {
    label: 'Methodology one-pager (PDF)',
    href: '/downloads/media/methodology-one-pager.txt',
    description: 'How ProtectOnt sources, verifies, and presents public data.',
  },
]

export const PRESS_CHART_ASSETS = [
  { label: 'Agency spending context chart', href: '/downloads/media/charts/agency-spending-chart.svg' },
  { label: 'Public vs for-profit delivery chart', href: '/downloads/media/charts/public-vs-private-chart.svg' },
  { label: 'Acute care beds per capita chart', href: '/downloads/media/charts/beds-per-capita-chart.svg' },
]

export const PRESS_QUOTES: PressQuote[] = [
  {
    text: 'Ontario has spent billions on private staffing agencies while public hospitals report deficits and staffing gaps — documented in Public Accounts and independent research.',
    attribution: 'ProtectOnt — Healthcare issue page',
    sourceUrl: 'https://protectont.ca/healthcare',
  },
  {
    text: 'Public services are how we share care; when they are cut, the load lands unevenly — on feminized jobs at work and unpaid caregiving at home.',
    attribution: 'ProtectOnt — Public care section',
    sourceUrl: 'https://protectont.ca/healthcare#shared-care',
  },
]

export const LOGO_ASSETS = [
  { label: 'Logo (primary)', href: '/logo-ledger-book.svg' },
  { label: 'Logo + text (light background)', href: '/logo-icon-text.svg' },
  { label: 'Logo + text (dark background)', href: '/logo-icon-text-dark.svg' },
  { label: 'Text only', href: '/logo-text-only.svg' },
  { label: 'Minimal mark', href: '/logo-minimal.svg' },
  { label: 'Open Graph / social share image', href: '/og-image.png' },
]
