import type { FordIssue, SocialPostIdea } from './social-post-ideas'

/** Default share graphics when a post has no custom imageUrl */
export const ISSUE_DEFAULT_IMAGE: Record<FordIssue, string> = {
  healthcare: '/products/yard-signs/ford-failed-you.png',
  education: '/products/yard-signs/ford-design-2.png',
  greenbelt: '/products/yard-signs/ford-design-1.png',
  'public-land': '/products/yard-signs/ford-design-1.png',
  water: '/products/yard-signs/ford-design-2.png',
  transparency: '/products/t-shirts/ford-sucks.png',
  accountability: '/products/yard-signs/ford-failed-you.png',
  'ontario-place': '/products/yard-signs/ford-design-1.png',
  'ring-of-fire': '/products/yard-signs/ford-design-2.png',
  foi: '/products/t-shirts/ford-sucks.png',
  'bike-lanes': '/products/yard-signs/ford-design-2.png',
}

/** Per-post overrides (yard signs, tees) */
const POST_IMAGE_OVERRIDES: Record<string, string> = {
  'acct-yard-sign-photo': '/products/yard-signs/ford-failed-you.png',
  'acct-reel-15s': '/products/t-shirts/ford-sucks-group.png',
  'trans-receipt-carousel': '/products/yard-signs/ford-design-1.png',
}

export function resolveSocialPostImage(idea: SocialPostIdea): string | undefined {
  if (idea.imageUrl?.trim()) return idea.imageUrl.trim()
  return POST_IMAGE_OVERRIDES[idea.id] ?? ISSUE_DEFAULT_IMAGE[idea.issue]
}

export const ISSUE_RESOURCE_LINKS: Record<FordIssue, { href: string; label: string }> = {
  healthcare: { href: '/healthcare', label: 'Healthcare page' },
  education: { href: '/message-guide', label: 'Message guide' },
  greenbelt: { href: '/public-land#greenbelt', label: 'Greenbelt facts' },
  'public-land': { href: '/public-land', label: 'Public land page' },
  water: { href: '/water', label: 'Water page' },
  transparency: { href: '/receipts', label: 'The Receipts' },
  accountability: { href: '/take-action', label: 'Take action' },
  'ontario-place': { href: '/public-land#ontario-place', label: 'Ontario Place facts' },
  'ring-of-fire': { href: '/indigenous-rights#ring-of-fire', label: 'Ring of Fire' },
  foi: { href: '/receipts', label: 'The Receipts' },
  'bike-lanes': { href: '/take-action', label: 'Take action' },
}

export const ISSUE_FLYER_LINKS: Record<FordIssue, { href: string; label: string } | undefined> = {
  healthcare: { href: '/flyers/healthcare', label: 'Healthcare flyer' },
  education: undefined,
  greenbelt: { href: '/flyers/public-land', label: 'Public land flyer' },
  'public-land': { href: '/flyers/public-land', label: 'Public land flyer' },
  water: { href: '/flyers/water', label: 'Water flyer' },
  transparency: { href: '/flyers/freedom-of-information', label: 'FOI flyer' },
  accountability: { href: '/flyers/accountability', label: 'Accountability flyer' },
  'ontario-place': { href: '/flyers/ontario-place', label: 'Ontario Place flyer' },
  'ring-of-fire': { href: '/flyers/ring-of-fire', label: 'Ring of Fire flyer' },
  foi: { href: '/flyers/freedom-of-information', label: 'FOI flyer' },
  'bike-lanes': { href: '/flyers/bike-lanes-safety', label: 'Bike lanes flyer' },
}

export const SOCIAL_SHARE_RESOURCES = [
  { href: '/flyers', label: 'Printable flyers', blurb: 'Letter-size PDFs for doors & boards' },
  { href: '/join#download-a-sign', label: 'Yard sign art', blurb: 'Free downloads + local delivery' },
  { href: '/protests#event-list', label: 'Find a protest', blurb: 'Events across Ontario' },
  { href: '/receipts', label: 'The Receipts', blurb: 'Who Ontario paid — public accounts' },
] as const
