import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata: Metadata = buildPageMetadata(
  'Social post ideas — Protect Ontario',
  'Ready-to-share captions and graphics for Facebook, Instagram, and more — copy posts with #FightFord and link to flyers, facts, and protests.'
)

export default function SocialIdeasLayout({ children }: { children: React.ReactNode }) {
  return children
}
