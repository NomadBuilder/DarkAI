import type { IndigenousCampaign, IndigenousProvince } from '@/lib/indigenous-hub'
import { PROVINCE_LABELS } from '@/lib/indigenous-hub'

/** Region-appropriate landscape photos (Wikimedia Commons) for land-theme preview. */
export type HubLandImage = {
  url: string
  credit: string
}

export const HUB_LAND_HERO: HubLandImage = {
  url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Morice_Canyon_-_Bulkley_River_-_panoramio.jpg/1600px-Morice_Canyon_-_Bulkley_River_-_panoramio.jpg',
  credit: 'Morice Canyon, Bulkley River — Wikimedia Commons / CC BY 3.0',
}

/** One verified photo per campaign — no duplicates. Omit slug to use the gradient fallback. */
export const HUB_CAMPAIGN_IMAGES: Partial<Record<string, HubLandImage>> = {
  'gidimten-yintah': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Morice_Canyon_-_Bulkley_River_-_panoramio.jpg/1280px-Morice_Canyon_-_Bulkley_River_-_panoramio.jpg',
    credit: 'Bulkley River region, BC — Wikimedia Commons',
  },
  'unistoten-camp': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/UnistotenCamp.jpg/1280px-UnistotenCamp.jpg',
    credit: 'Unist\'ot\'en Camp — Wikimedia Commons / CC BY-SA 4.0',
  },
  'likhtsamisyu-climate': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Bulkley_River_flowing_into_Skeena_River_near_Hazelton%2C_British_Columbia.jpg/1280px-Bulkley_River_flowing_into_Skeena_River_near_Hazelton%2C_British_Columbia.jpg',
    credit: 'Skeena River region, BC — Wikimedia Commons',
  },
  'tiny-house-warriors': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Railway_bridge_over_the_North_Thompson_River_-_Thompson-Nicola_Regional_District%2C_British_Columbia%2C_Canada_-_July_1990_01.jpg/1280px-Railway_bridge_over_the_North_Thompson_River_-_Thompson-Nicola_Regional_District%2C_British_Columbia%2C_Canada_-_July_1990_01.jpg',
    credit: 'North Thompson River, Secwepemc territory — Wikimedia Commons',
  },
  'grassy-narrows': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/English_River_ON.JPG/1280px-English_River_ON.JPG',
    credit: 'English River, Ontario — Wikimedia Commons',
  },
  'mushkegowuk-ring-of-fire': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Springtime_in_James_Bay_%28MODIS_2022-06-22%29.jpg/1280px-Springtime_in_James_Bay_%28MODIS_2022-06-22%29.jpg',
    credit: 'James Bay lowlands — Wikimedia Commons / NASA',
  },
  'wsanec-land-trust': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Lighthouse_Marine_Park_Lookout%2C_Point_Roberts%2C_looking_toward_the_Salish_Sea.jpg/1280px-Lighthouse_Marine_Park_Lookout%2C_Point_Roberts%2C_looking_toward_the_Salish_Sea.jpg',
    credit: 'Salish Sea — Wikimedia Commons',
  },
  'sipeknekatik-fishery': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/File_Nova_Scotia_-_Sober_Island_-_fishing_boat_%E2%80%98Terry_and_Margaret%E2%80%99_and_lobster_traps.jpg/1280px-File_Nova_Scotia_-_Sober_Island_-_fishing_boat_%E2%80%98Terry_and_Margaret%E2%80%99_and_lobster_traps.jpg',
    credit: 'Nova Scotia fishery — Wikimedia Commons',
  },
  'acfn-tar-sands': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Athabasca_River_at_Sunrise.jpg/1280px-Athabasca_River_at_Sunrise.jpg',
    credit: 'Athabasca River, Alberta — Wikimedia Commons',
  },
  'land-needs-guardians': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Cedar_cabin_in_the_Great_Bear_Rainforest.jpg/1280px-Cedar_cabin_in_the_Great_Bear_Rainforest.jpg',
    credit: 'Great Bear Rainforest, BC — Wikimedia Commons',
  },
  'indigenous-climate-action': {
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/2018-05-20_Salish_Sea_Sunset_%2841543181514%29.jpg',
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
