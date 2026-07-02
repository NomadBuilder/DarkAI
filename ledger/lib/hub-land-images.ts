import type { IndigenousCampaign, IndigenousProvince } from '@/lib/indigenous-hub'
import { PROVINCE_LABELS } from '@/lib/indigenous-hub'

/** Region-appropriate landscape photos (Wikimedia Commons, bundled locally) for the land theme. */
export type HubLandImage = {
  url: string
  credit: string
  alt?: string
}

export const HUB_LAND_HERO: HubLandImage = {
  url: '/hub/hero-morice-canyon.jpg',
  credit: 'Morice Canyon, Bulkley River — Wikimedia Commons / CC BY 3.0',
  alt: 'Morice Canyon on the Bulkley River in British Columbia',
}

function hubImagePath(slug: string): string {
  return `/hub/${slug}.jpg`
}

/** One verified photo per campaign — bundled under public/hub/ (no hotlinked Wikimedia thumbs). */
export const HUB_CAMPAIGN_IMAGES: Partial<Record<string, HubLandImage>> = {
  'gidimten-yintah': {
    url: hubImagePath('gidimten-yintah'),
    credit: 'Bulkley River region, BC — Wikimedia Commons',
  },
  'unistoten-camp': {
    url: hubImagePath('unistoten-camp'),
    credit: 'Unist\'ot\'en Camp — Wikimedia Commons / CC BY-SA 4.0',
  },
  'likhtsamisyu-climate': {
    url: hubImagePath('likhtsamisyu-climate'),
    credit: 'Skeena River region, BC — Wikimedia Commons',
  },
  'tiny-house-warriors': {
    url: hubImagePath('tiny-house-warriors'),
    credit: 'North Thompson River, Secwepemc territory — Wikimedia Commons',
  },
  'grassy-narrows': {
    url: hubImagePath('grassy-narrows'),
    credit: 'English River, Ontario — Wikimedia Commons',
  },
  'mushkegowuk-ring-of-fire': {
    url: hubImagePath('mushkegowuk-ring-of-fire'),
    credit: 'James Bay lowlands — Wikimedia Commons / NASA',
  },
  'wsanec-land-trust': {
    url: hubImagePath('wsanec-land-trust'),
    credit: 'Salish Sea — Wikimedia Commons',
  },
  'sipeknekatik-fishery': {
    url: hubImagePath('sipeknekatik-fishery'),
    credit: 'Nova Scotia fishery — Wikimedia Commons',
  },
  'acfn-tar-sands': {
    url: hubImagePath('acfn-tar-sands'),
    credit: 'Athabasca River, Alberta — Wikimedia Commons',
  },
  'land-needs-guardians': {
    url: hubImagePath('land-needs-guardians'),
    credit: 'Great Bear Rainforest, BC — Wikimedia Commons',
  },
  'indigenous-climate-action': {
    url: hubImagePath('indigenous-climate-action'),
    credit: 'Pacific Northwest — Wikimedia Commons / CC BY 2.0',
  },
}

export type HubLandFallback = {
  label: string
  gradientClass: string
}

const PROVINCE_FALLBACK: Record<IndigenousProvince, HubLandFallback> = {
  BC: {
    label: 'British Columbia',
    gradientClass: 'bg-gradient-to-br from-[#1a3d2e] via-[#2d4a36] to-[#3d5c5a]',
  },
  ON: {
    label: 'Ontario',
    gradientClass: 'bg-gradient-to-br from-[#1c2e24] via-[#2a4035] to-[#4a5c48]',
  },
  AB: {
    label: 'Alberta',
    gradientClass: 'bg-gradient-to-br from-[#3d3428] via-[#5c4a32] to-[#6b5344]',
  },
  NS: {
    label: 'Nova Scotia',
    gradientClass: 'bg-gradient-to-br from-[#1e3340] via-[#2a4550] to-[#3d5c5a]',
  },
  QC: {
    label: 'Quebec',
    gradientClass: 'bg-gradient-to-br from-[#1c2830] via-[#2d3d45] to-[#3d5c5a]',
  },
  MB: {
    label: 'Manitoba',
    gradientClass: 'bg-gradient-to-br from-[#243328] via-[#354a3a] to-[#4a5c48]',
  },
  SK: {
    label: 'Saskatchewan',
    gradientClass: 'bg-gradient-to-br from-[#3a3428] via-[#4a4535] to-[#5c5648]',
  },
  NT: {
    label: 'Northwest Territories',
    gradientClass: 'bg-gradient-to-br from-[#1a2830] via-[#2a3840] to-[#3d5058]',
  },
  YT: {
    label: 'Yukon',
    gradientClass: 'bg-gradient-to-br from-[#2a3035] via-[#3d4548] to-[#4a5c5a]',
  },
  NL: {
    label: 'Newfoundland & Labrador',
    gradientClass: 'bg-gradient-to-br from-[#1e3340] via-[#2a4550] to-[#3d5c5a]',
  },
  NB: {
    label: 'New Brunswick',
    gradientClass: 'bg-gradient-to-br from-[#1e3340] via-[#2a4550] to-[#3d5c5a]',
  },
  PE: {
    label: 'Prince Edward Island',
    gradientClass: 'bg-gradient-to-br from-[#1e3340] via-[#2a4550] to-[#3d5c5a]',
  },
  NU: {
    label: 'Nunavut',
    gradientClass: 'bg-gradient-to-br from-[#1a2830] via-[#2a3840] to-[#3d5058]',
  },
  National: {
    label: 'Canada',
    gradientClass: 'bg-gradient-to-br from-[#1a3d2e] via-[#2d4a36] to-[#3d5c5a]',
  },
}

export function getCampaignLandImage(slug: string): HubLandImage | undefined {
  return HUB_CAMPAIGN_IMAGES[slug]
}

export function getCampaignLandFallback(campaign: Pick<IndigenousCampaign, 'provinces' | 'mapLabel'>): HubLandFallback {
  const primary = campaign.provinces[0]
  const base = primary ? PROVINCE_FALLBACK[primary] : PROVINCE_FALLBACK.BC
  const label = campaign.mapLabel ?? (primary ? PROVINCE_LABELS[primary] : base.label)
  return { ...base, label }
}

if (process.env.NODE_ENV === 'development') {
  const seen = new Map<string, string>()
  for (const [slug, image] of Object.entries(HUB_CAMPAIGN_IMAGES)) {
    if (!image) continue
    const prev = seen.get(image.url)
    if (prev) {
      console.warn(`[hub-land-images] duplicate photo: ${prev} and ${slug} share ${image.url}`)
    } else {
      seen.set(image.url, slug)
    }
  }
}
