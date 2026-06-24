import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata: Metadata = buildPageMetadata(
  'Indigenous rights — Protect Ontario',
  'Free, prior, and informed consent, Ring of Fire, and major projects — rights and accountability in Ontario.'
)

export default function IndigenousRightsLayout({ children }: { children: React.ReactNode }) {
  return children
}
