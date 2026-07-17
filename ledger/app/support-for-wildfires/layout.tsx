import type { Metadata } from 'next'
import { WILDFIRE_CAMPAIGN } from '@/lib/wildfire-campaign'

const title = 'Help Support Namaygoosisagagun First Nation | Protect Ontario'
const description =
  'Join the Protect Ontario community in supporting Namaygoosisagagun First Nation following wildfire displacement. Donate directly through the official fundraiser and help grow our collective impact.'
const ogTitle = 'Help Support Namaygoosisagagun First Nation'
const ogDescription =
  'ProtectOnt is matching the first $250. Join our community in supporting Namaygoosisagagun First Nation after wildfire displacement — donate through the official fundraiser.'

/** Absolute OG URL — social crawlers need a full URL, not a relative path. */
const OG_IMAGE_URL = `https://protectont.ca${WILDFIRE_CAMPAIGN.heroImageUrl}`
const OG_IMAGE_ALT = 'Wildfire smoke rising over a lake near Namaygoosisagagun First Nation'

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: WILDFIRE_CAMPAIGN.canonicalUrl,
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: ogTitle,
    description: ogDescription,
    url: WILDFIRE_CAMPAIGN.canonicalUrl,
    type: 'website',
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1024,
        height: 576,
        type: 'image/jpeg',
        alt: OG_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: ogTitle,
    description: ogDescription,
    images: [{ url: OG_IMAGE_URL, alt: OG_IMAGE_ALT }],
  },
}

export default function SupportForWildfiresLayout({ children }: { children: React.ReactNode }) {
  return children
}
