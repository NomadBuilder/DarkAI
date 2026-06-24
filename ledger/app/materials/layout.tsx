import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata: Metadata = buildPageMetadata(
  'Materials — Protect Ontario',
  'Protest signs, shirt transfers, stickers, printable flyers, and social posts for Ontario demonstrations.'
)

export default function MaterialsLayout({ children }: { children: React.ReactNode }) {
  return children
}
