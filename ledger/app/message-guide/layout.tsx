import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata: Metadata = buildPageMetadata(
  'Message guide — Protect Ontario',
  'Talking points by issue with “say this / avoid this” phrasing — linked to sourced facts, flyers, and protests.'
)

export default function MessageGuideLayout({ children }: { children: React.ReactNode }) {
  return children
}
