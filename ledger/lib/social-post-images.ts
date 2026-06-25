import type { FordIssue, SocialPostIdea } from './social-post-ideas'

/** True only when the editor explicitly set a background (upload or URL). */
export function hasCustomSocialBackground(idea: SocialPostIdea): boolean {
  const url = idea.imageUrl?.trim()
  return Boolean(url && (url.startsWith('data:') || url.startsWith('http')))
}

/** @deprecated Yard-sign defaults removed — graphics are text-generated. */
export function resolveSocialPostImage(_idea: SocialPostIdea): string | undefined {
  return undefined
}

export const ISSUE_RESOURCE_LINKS: Record<FordIssue, { href: string; label: string }> = {
  healthcare: { href: '/healthcare', label: 'Healthcare page' },
  education: { href: '/message-guide', label: 'Message guide' },
  'public-land': { href: '/public-land', label: 'Public land page' },
  greenbelt: { href: '/public-land#greenbelt', label: 'Greenbelt facts' },
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
