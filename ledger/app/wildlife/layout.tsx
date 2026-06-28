import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata: Metadata = buildPageMetadata(
  'Wildlife & Animal Protection — Protect Ontario',
  'Bill 5 species rollbacks and Bill 75 research-animal regulations in Ontario — what changed, what loopholes remain, and primary sources.'
)

export default function WildlifeLayout({ children }: { children: React.ReactNode }) {
  return children
}
