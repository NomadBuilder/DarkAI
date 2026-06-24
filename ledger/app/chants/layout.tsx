import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata: Metadata = buildPageMetadata(
  'Chant bank — Protect Ontario',
  'Search chants by tone and print quick call-and-response cards for rallies and demonstrations across Ontario.'
)

export default function ChantsLayout({ children }: { children: React.ReactNode }) {
  return children
}
