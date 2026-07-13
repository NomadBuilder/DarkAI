export type ProtectOntReport = {
  slug: string
  title: string
  subtitle: string
  description: string
  dateLabel: string
  href: string
  /** Short badge shown on the card */
  badge?: string
}

/** Published ProtectOnt reports (accountability briefs, deep dives). */
export const PROTECTONT_REPORTS: ProtectOntReport[] = [
  {
    slug: 'they-called-it-protection',
    title: 'Protect Ontario accountability brief',
    subtitle: 'Six bills. One pattern. Your MPP’s votes.',
    description:
      'How “Protect Ontario” branding covered species-law rollbacks, special economic zones, water corporations, and budget omnibuses — plus a postal lookup for your MPP’s Yes / No / No Show on Bills 5, 17, 24, 60, 68 & 97.',
    dateLabel: 'July 2026',
    href: '/reports/they-called-it-protection',
    badge: 'Featured',
  },
]
