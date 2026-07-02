import type { Metadata } from 'next'

const HUB_OG_IMAGE = '/indigenous-og-image.png'

/** Per-route metadata for static export — title, description, OG, and indexing. */
export function buildPageMetadata(title: string, description: string, ogImage?: string): Metadata {
  const images = ogImage
    ? [{ url: ogImage, width: 1200, height: 630, type: 'image/png' as const, alt: title }]
    : undefined

  return {
    title,
    description,
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: 'website',
      ...(images ? { images } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(images ? { images: [ogImage!] } : {}),
    },
  }
}

/** Metadata for Standing for the Land (/stand4land) pages with dedicated social image. */
export function buildHubPageMetadata(title: string, description: string, ogImage?: string): Metadata {
  return buildPageMetadata(title, description, ogImage ?? HUB_OG_IMAGE)
}

/** Per-campaign metadata with generated OG card. */
export function buildCampaignPageMetadata(title: string, description: string, slug: string): Metadata {
  return buildPageMetadata(title, description, `/hub/og/${slug}.png`)
}
