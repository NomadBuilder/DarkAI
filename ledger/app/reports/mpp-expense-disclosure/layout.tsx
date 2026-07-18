import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata: Metadata = buildPageMetadata(
  'What MPP expense disclosure actually shows — ProtectOnt',
  'Split travel from hospitality in OLA Members’ expense disclosure: House medians, rankings, hospitality outliers, and a postal lookup for your MPP.'
)

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
