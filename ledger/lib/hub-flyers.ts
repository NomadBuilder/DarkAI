import type { Flyer, FlyerShared, FlyersFile } from '@/lib/flyers'
import type { FlyerTheme } from '@/lib/flyer-theme'

/** Land-theme colors for Standing for the Land printable flyers. */
export const HUB_LAND_FLYER_THEME: Partial<FlyerTheme> = {
  headerColorTop: '#1a4d3a',
  headerColorBottom: '#142818',
  footerColorTop: '#2d4a36',
  footerColorBottom: '#1c2419',
  bodyBackground: '#faf8f4',
  accentColor: '#c4a574',
  primaryColor: '#1a4d3a',
  highlightColor: '#e8dfd0',
  headlineColor: '#e8dfd0',
  subtitleColor: '#ffffff',
  introColor: '#e8f0e4',
  sectionTitleColor: '#1a4d3a',
  bodyTextColor: '#1c2419',
  highlightTagTextColor: '#1c2419',
  calloutBackground: 'rgba(196, 165, 116, 0.18)',
  calloutTitleColor: '#1a4d3a',
  footerHeadingColor: '#e8dfd0',
  footerCtaTextColor: '#ffffff',
}

export const HUB_FLYER_SITE_URL = 'https://protectont.ca/stand4land/'

export const HUB_FLYER_SHARED: FlyerShared = {
  footerHeading: 'Standing for the Land',
  footerFinePrint:
    'This directory links to official Indigenous-led campaigns. We do not speak for Nations or collect donations. Always verify links on each campaign’s official website.',
  ctas: [
    { label: 'Website', text: 'protectont.ca/stand4land' },
    { label: 'Map', text: 'protectont.ca/stand4land/map' },
    { label: 'Campaigns', text: 'protectont.ca/stand4land/campaigns' },
  ],
}

const hubFlyerEntries: Flyer[] = [
  {
    id: 'hub-overview',
    slug: 'overview',
    title: 'Standing for the Land',
    subtitle: 'Indigenous-led land & water defence',
    intro:
      'Active land and water defence campaigns are underway across Canada — pipelines, mining, treaty rights, fisheries, and Land Back. This map and directory links only to official Nation and campaign channels.',
    heroImageUrl: '/hub/hero-morice-canyon.jpg',
    highlights: ['12 campaigns', 'Official links only', 'Coast to coast'],
    sections: [
      {
        title: 'What you will find',
        lead: 'Use the site to find verified paths to support — never through third-party fundraisers.',
        bullets: [
          'Interactive map of active campaigns across Canada',
          'Search by province, issue, and campaign status',
          'Official donate, volunteer, and petition links for each listing',
          'Learning guides on Land Back, FPIC, treaties, and IPCAs',
        ],
      },
      {
        title: 'Featured fights (examples)',
        bullets: [
          'Wet\'suwet\'en — Coastal GasLink pipeline defence (BC)',
          'Grassy Narrows — mercury justice and territory (ON)',
          'Mushkegowuk — Ring of Fire mining consent (ON)',
          'Unist\'ot\'en, Tiny House Warriors, Sipekne\'katik fishery, and more',
        ],
      },
      {
        title: 'How to use this flyer',
        lead: 'Print letter-size for community boards, tabling, and events.',
        bullets: [
          'Scan the QR code or visit protectont.ca/stand4land',
          'Pick a campaign — open its official site to donate or volunteer',
          'Share the link; do not reword Nation messaging',
        ],
      },
    ],
    calloutTitle: 'Support flows to official channels',
    calloutBody:
      'We never collect donations on behalf of movements listed here. If a link is not on a campaign’s official website or verified social accounts, do not trust it.',
    calloutActions: [
      { label: 'Browse', text: 'protectont.ca/stand4land/campaigns' },
      { label: 'Learn', text: 'protectont.ca/stand4land/learn' },
    ],
    published: true,
    theme: HUB_LAND_FLYER_THEME,
  },
  {
    id: 'hub-support',
    slug: 'how-to-support',
    title: 'How to help',
    subtitle: 'Land & water defence in Canada',
    intro:
      'The most effective solidarity goes directly to Nations and campaigns — not through unofficial fundraisers. Here is how to show up responsibly.',
    heroImageUrl: '',
    highlights: ['Official channels', 'Verify first', 'Follow Nation leadership'],
    sections: [
      {
        title: 'Donate through official sites',
        bullets: [
          'Each campaign page lists verified donation links — legal funds, frontline camps, Land Back trusts',
          'Use only links on the official campaign website or verified social accounts',
          'Watch for fraudulent GoFundMes — camps often warn about impersonators',
        ],
      },
      {
        title: 'Volunteer & show up',
        bullets: [
          'Rallies and gatherings are announced on official campaign and Nation channels',
          'Follow safety guidance and protocols on the land',
          'Centre Nation voices — share official materials, do not speak over them',
        ],
      },
      {
        title: 'Learn before you share',
        bullets: [
          'Read about FPIC, treaties, and Land Back at protectont.ca/stand4land/learn',
          'Share links to official campaign pages — not reworded summaries',
          'Use the map to see what is active in each region',
        ],
      },
    ],
    calloutTitle: 'Find campaigns near you',
    calloutBody: 'Standing for the Land maps Indigenous-led campaigns across Canada with official support links for each one.',
    calloutActions: [{ label: 'Open map', text: 'protectont.ca/stand4land/map' }],
    published: true,
    theme: HUB_LAND_FLYER_THEME,
  },
]

export function getHubFlyersFile(): FlyersFile {
  return {
    lastUpdated: new Date().toISOString().slice(0, 10),
    shared: HUB_FLYER_SHARED,
    flyers: hubFlyerEntries,
  }
}

export function getHubFlyerBySlug(slug: string): Flyer | undefined {
  return hubFlyerEntries.find((f) => f.slug === slug && f.published)
}

export function getPublishedHubFlyers(): Flyer[] {
  return hubFlyerEntries.filter((f) => f.published)
}

export const HUB_FLYER_SLUGS = hubFlyerEntries.filter((f) => f.published).map((f) => f.slug)
