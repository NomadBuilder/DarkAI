import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata: Metadata = buildPageMetadata(
  'Reports — ProtectOnt',
  'Accountability briefs on Ontario’s “Protect Ontario” bills — what changed, how fast they passed, and how your MPP voted.'
)

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return children
}
