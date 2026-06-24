import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata: Metadata = buildPageMetadata(
  'Take action — Protect Ontario',
  'Ways to push back on cuts, privatization, and closed-door deals — contact your MPP, join a protest, or share materials.'
)

export default function TakeActionLayout({ children }: { children: React.ReactNode }) {
  return children
}
