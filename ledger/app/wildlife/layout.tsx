import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata: Metadata = buildPageMetadata(
  'Wildlife & Animal Protection — Protect Ontario',
  'Endangered species rollbacks under Bill 5, research-animal rules under Bill 75, and what Ontarians stand to lose — with primary sources.'
)

export default function WildlifeLayout({ children }: { children: React.ReactNode }) {
  return children
}
