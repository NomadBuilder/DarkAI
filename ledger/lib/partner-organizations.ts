export type PartnerOrganization = {
  id: string
  name: string
  href: string
  logoSrc: string
  /** Optional label above the logo within the same fixed height slot */
  logoCaption?: string
}

/** Homepage partner carousel — add entries here to show more logos. */
export const partnerOrganizations: PartnerOrganization[] = [
  {
    id: 'onac',
    name: 'Ontarians Against Corruption',
    href: 'https://www.onac.ca/',
    logoSrc: '/partners/onac.png',
  },
  {
    id: 'ohc',
    name: 'Ontario Health Coalition',
    href: 'https://www.ontariohealthcoalition.ca/',
    logoSrc: '/partners/ohc.png',
  },
  {
    id: 'fighting-ford',
    name: 'Fighting Ford',
    href: 'https://www.facebook.com/groups/999677935818616/',
    logoSrc: '/partners/fighting-ford.png',
    logoCaption: 'Fighting Ford',
  },
  {
    id: 'democracy-watch',
    name: 'Democracy Watch',
    href: 'https://democracywatch.ca/',
    logoSrc: '/partners/democracy-watch.png',
  },
]
