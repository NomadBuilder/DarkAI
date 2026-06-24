import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata: Metadata = buildPageMetadata(
  'Wildlife — Protect Ontario',
  'Species protections and environmental safeguards weakened in Ontario — documented policy rollbacks and community impact.'
)

export default function WildlifeLayout({ children }: { children: React.ReactNode }) {
  return children
}
