/**
 * Defaults + helpers for /support-for-wildfires/.
 *
 * Live totals are edited in admin and saved to public/data/wildfire-campaign.json
 * (see wildfire-campaign-store.ts). This object is the fallback/default shape.
 */

export type WildfireDonationEntry = {
  /** Display name, or "Anonymous" */
  displayName: string
  amount: number
  /** ISO date string YYYY-MM-DD */
  date: string
}

export type WildfirePressLink = {
  label: string
  href: string
}

export type WildfireCampaignConfig = {
  communityTotal: number
  donorCount: number
  matchMaximum: number
  /** True once the matching donation has actually been made */
  matchCompleted: boolean
  /** Public confirmation page/image URL (private info removed). Empty = hide link. */
  matchConfirmationUrl: string
  contactEmail: string
  /** Optional external confirmation form. Empty = hide button. */
  confirmationFormUrl: string
  showDonorList: boolean
  donations: WildfireDonationEntry[]
  campaignLaunchDate: string
  officialDonationUrl: string
  /** Official e-transfer address for the charity fundraiser */
  etransferEmail: string
  pagePath: string
  canonicalUrl: string
  milestones: number[]
  shareMessage: string
  heroImageUrl: string
  pressLinks: WildfirePressLink[]
}

export const WILDFIRE_CAMPAIGN: WildfireCampaignConfig = {
  communityTotal: 0,
  donorCount: 0,
  matchMaximum: 250,
  matchCompleted: true,
  matchConfirmationUrl: '',
  contactEmail: 'protectont@gmail.com',
  confirmationFormUrl: '',
  showDonorList: true,
  donations: [],
  campaignLaunchDate: '2026-07-17',
  officialDonationUrl: 'https://an7gc.ca/donate/',
  etransferEmail: 'an7gc@anishinabek.ca',
  pagePath: '/support-for-wildfires/',
  canonicalUrl: 'https://protectont.ca/support-for-wildfires/',
  milestones: [250, 500, 1000, 2500, 5000],
  shareMessage:
    'ProtectOnt is matching the first $250 donated by our community for Namaygoosisagagun First Nation wildfire relief. Donate through the official fundraiser and help grow our collective impact.',
  heroImageUrl: '/support-wildfires-hero.jpg',
  pressLinks: [
    {
      label: 'CBC News: Entire community displaced by wildfire',
      href: 'https://www.cbc.ca/news/canada/thunder-bay/namaygoosisagagun-first-nation-wildfire-9.7272350',
    },
    {
      label: 'Watch the CBC video report',
      href: 'https://www.cbc.ca/player/play/video/9.7274270',
    },
  ],
}

export type WildfireCampaignDerived = {
  personalMatch: number
  combinedImpact: number
  matchedProgress: number
  matchUnlocked: boolean
  nextMilestone: number | null
  amountToNextMilestone: number | null
}

export function deriveWildfireCampaign(
  campaign: WildfireCampaignConfig = WILDFIRE_CAMPAIGN
): WildfireCampaignDerived {
  const personalMatch = Math.min(campaign.communityTotal, campaign.matchMaximum)
  const combinedImpact = campaign.communityTotal + personalMatch
  const matchedProgress = Math.min(
    (campaign.communityTotal / campaign.matchMaximum) * 100,
    100
  )
  const matchUnlocked = campaign.communityTotal >= campaign.matchMaximum

  const nextMilestone =
    campaign.milestones.find((m) => m > campaign.communityTotal) ?? null
  const amountToNextMilestone =
    nextMilestone != null ? nextMilestone - campaign.communityTotal : null

  return {
    personalMatch,
    combinedImpact,
    matchedProgress,
    matchUnlocked,
    nextMilestone,
    amountToNextMilestone,
  }
}

export function formatCad(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDonationDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function confirmationMailto(campaign: WildfireCampaignConfig): string {
  const subject = encodeURIComponent(
    'Protect Ontario community donation — Namaygoosisagagun First Nation'
  )
  const body = encodeURIComponent(
    [
      'Hi,',
      '',
      'I donated through the official Anishinabek Nation 7th Generation Charity fundraiser and would like my donation included in the Protect Ontario community total.',
      '',
      'Donation amount: $',
      'Display name (or Anonymous):',
      'I confirm this donation was made at https://an7gc.ca/donate/',
      '',
      'Thank you.',
    ].join('\n')
  )
  return `mailto:${campaign.contactEmail}?subject=${subject}&body=${body}`
}

export function shareEmailHref(campaign: WildfireCampaignConfig): string {
  const subject = encodeURIComponent(
    'Help Support Namaygoosisagagun First Nation'
  )
  const body = encodeURIComponent(
    `${campaign.shareMessage}\n\nDonate: ${campaign.officialDonationUrl}\n\nFollow our community total: ${campaign.canonicalUrl}`
  )
  return `mailto:?subject=${subject}&body=${body}`
}
