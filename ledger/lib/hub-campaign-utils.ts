import type { HubTimelineEvent, IndigenousCampaign } from '@/lib/indigenous-hub'
import { HUB_SITE_NAME, PROVINCE_LABELS, indigenousHubPath } from '@/lib/indigenous-hub'

export const HUB_CANONICAL_SITE = 'https://protectont.ca'

export function hubCampaignPageUrl(slug: string): string {
  return `${HUB_CANONICAL_SITE}${indigenousHubPath('campaigns', slug)}`
}

export function hubCampaignOgImagePath(slug: string): string {
  return `/hub/og/${slug}.png`
}

export function hubCampaignFlyerPath(slug: string): string {
  return `/downloads/hub-campaigns/${slug}.pdf`
}

export function hubMapCampaignUrl(slug: string): string {
  return `${HUB_CANONICAL_SITE}${indigenousHubPath('map')}?campaign=${encodeURIComponent(slug)}`
}

export function hubCampaignShareText(campaign: IndigenousCampaign): string {
  const directoryUrl = hubCampaignPageUrl(campaign.slug)
  const official = campaign.officialSite?.href
  if (official) {
    return `Official campaign page for ${campaign.title}: ${official}\n\nMore verified links on ${HUB_SITE_NAME}: ${directoryUrl}`
  }
  return `Verified campaign links for ${campaign.title} on ${HUB_SITE_NAME}: ${directoryUrl}`
}

export function hubCampaignShareUrl(campaign: IndigenousCampaign): string {
  return campaign.officialSite?.href ?? hubCampaignPageUrl(campaign.slug)
}

export function buildCampaignJsonLd(campaign: IndigenousCampaign) {
  const pageUrl = hubCampaignPageUrl(campaign.slug)
  const region = campaign.provinces.map((p) => PROVINCE_LABELS[p]).join(', ')

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: campaign.title,
    description: campaign.summary,
    url: campaign.officialSite?.href ?? pageUrl,
    areaServed: region || 'Canada',
    ...(campaign.nations.length
      ? { alternateName: campaign.nations.join(', ') }
      : {}),
  }

  const events = campaign.timeline.map((ev: HubTimelineEvent) => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: ev.title,
    description: ev.summary ?? ev.title,
    startDate: normalizeTimelineDate(ev.date),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: campaign.mapLabel ?? region ?? 'Canada',
    },
    ...(ev.sourceUrl ? { url: ev.sourceUrl } : {}),
  }))

  return { organization, events }
}

function normalizeTimelineDate(date: string): string {
  if (/^\d{4}$/.test(date)) return `${date}-01-01`
  if (/^\d{4}–\d{4}$/.test(date) || /^\d{4}-\d{4}$/.test(date)) {
    return date.split(/[–-]/)[0].trim() + '-01-01'
  }
  return date
}
