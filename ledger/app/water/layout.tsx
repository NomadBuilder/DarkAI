import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata: Metadata = buildPageMetadata(
  'Water — Protect Ontario',
  'Water and wastewater policy in Ontario — privatization pathways, ratepayer risk, and community accountability.'
)

export default function WaterLayout({ children }: { children: React.ReactNode }) {
  return children
}
