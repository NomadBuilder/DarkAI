import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata: Metadata = buildPageMetadata(
  'Public land — Protect Ontario',
  'Greenbelt, Ontario Place, parks, and public land sell-offs — sourced facts on what is being opened up.'
)

export default function PublicLandLayout({ children }: { children: React.ReactNode }) {
  return children
}
