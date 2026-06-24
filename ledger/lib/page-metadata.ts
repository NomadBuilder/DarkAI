import type { Metadata } from 'next'

/** Per-route metadata for static export — title, description, OG, and indexing. */
export function buildPageMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}
