/**
 * Load / save wildfire campaign JSON for public page + admin.
 * Live updates write to ledger/public/data and static/protectont/data.
 */

import {
  WILDFIRE_CAMPAIGN,
  type WildfireCampaignConfig,
  type WildfireDonationEntry,
  type WildfirePressLink,
} from './wildfire-campaign'

export function defaultWildfireCampaign(): WildfireCampaignConfig {
  return {
    ...WILDFIRE_CAMPAIGN,
    donations: [...WILDFIRE_CAMPAIGN.donations],
    milestones: [...WILDFIRE_CAMPAIGN.milestones],
    pressLinks: WILDFIRE_CAMPAIGN.pressLinks.map((p) => ({ ...p })),
  }
}

function asNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
    return Number(value)
  }
  return fallback
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function normalizeDonation(raw: unknown): WildfireDonationEntry | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const amount = asNumber(o.amount, NaN)
  if (!Number.isFinite(amount) || amount < 0) return null
  const displayName = asString(o.displayName, 'Anonymous').trim() || 'Anonymous'
  const date = asString(o.date, new Date().toISOString().slice(0, 10)).trim()
  return { displayName, amount, date }
}

function normalizePressLink(raw: unknown): WildfirePressLink | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const label = asString(o.label).trim()
  const href = asString(o.href).trim()
  if (!label || !href) return null
  return { label, href }
}

export function parseWildfireCampaign(data: unknown): WildfireCampaignConfig {
  const base = defaultWildfireCampaign()
  if (!data || typeof data !== 'object') return base
  const o = data as Record<string, unknown>

  const donations = Array.isArray(o.donations)
    ? o.donations.map(normalizeDonation).filter((d): d is WildfireDonationEntry => d !== null)
    : base.donations

  const milestones = Array.isArray(o.milestones)
    ? o.milestones.map((m) => asNumber(m, NaN)).filter((n) => Number.isFinite(n) && n > 0)
    : base.milestones

  const pressLinks = Array.isArray(o.pressLinks)
    ? o.pressLinks.map(normalizePressLink).filter((p): p is WildfirePressLink => p !== null)
    : base.pressLinks

  return {
    communityTotal: asNumber(o.communityTotal, base.communityTotal),
    donorCount: asNumber(o.donorCount, base.donorCount),
    matchMaximum: asNumber(o.matchMaximum, base.matchMaximum),
    matchCompleted: Boolean(o.matchCompleted),
    matchConfirmationUrl: asString(o.matchConfirmationUrl, base.matchConfirmationUrl),
    contactEmail: asString(o.contactEmail, base.contactEmail),
    confirmationFormUrl: asString(o.confirmationFormUrl, base.confirmationFormUrl),
    showDonorList: o.showDonorList === undefined ? base.showDonorList : Boolean(o.showDonorList),
    donations,
    campaignLaunchDate: asString(o.campaignLaunchDate, base.campaignLaunchDate),
    officialDonationUrl: asString(o.officialDonationUrl, base.officialDonationUrl),
    etransferEmail: asString(o.etransferEmail, base.etransferEmail),
    pagePath: asString(o.pagePath, base.pagePath),
    canonicalUrl: asString(o.canonicalUrl, base.canonicalUrl),
    milestones: milestones.length ? milestones : base.milestones,
    shareMessage: asString(o.shareMessage, base.shareMessage),
    heroImageUrl: asString(o.heroImageUrl, base.heroImageUrl),
    pressLinks: pressLinks.length ? pressLinks : base.pressLinks,
  }
}

/** Sum donation rows into community totals (admin helper). */
export function totalsFromDonations(donations: WildfireDonationEntry[]): {
  communityTotal: number
  donorCount: number
} {
  const communityTotal = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
  return { communityTotal, donorCount: donations.length }
}

export function serializeWildfireCampaign(campaign: WildfireCampaignConfig): string {
  const clean = parseWildfireCampaign(campaign)
  return JSON.stringify(clean, null, 2) + '\n'
}

export async function loadWildfireCampaign(): Promise<WildfireCampaignConfig> {
  for (const path of ['/data/wildfire-campaign.json', '/api/protectont/wildfire-campaign']) {
    try {
      const res = await fetch(path, { cache: 'no-store' })
      if (!res.ok) continue
      return parseWildfireCampaign(await res.json())
    } catch {
      /* try next */
    }
  }
  return defaultWildfireCampaign()
}
