import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata: Metadata = buildPageMetadata(
  'Social post ideas — Protect Ontario',
  'Download branded 1080×1080 graphics and copy-ready captions for Instagram and Facebook — tied to flyers, facts, and #FightFord.'
)

export default function SocialIdeasLayout({ children }: { children: React.ReactNode }) {
  return children
}
