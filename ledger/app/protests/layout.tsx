import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata: Metadata = buildPageMetadata(
  'Protests — Protect Ontario',
  'Find protests, rallies, and campaigns across Ontario — filter by date, city, and topic.'
)

export default function ProtestsLayout({ children }: { children: React.ReactNode }) {
  return children
}
