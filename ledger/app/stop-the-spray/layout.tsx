import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata: Metadata = buildPageMetadata(
  'Stop the Spray — ProtectOnt',
  'Chemical forestry sprays herbicides over public forests to favour softwood plantations. Seventy years of poison swaps, ignored Senate advice, and a proven Québec alternative — with links to Stop the Spray Canada.'
)

export default function StopTheSprayLayout({ children }: { children: React.ReactNode }) {
  return children
}
