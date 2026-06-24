import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata: Metadata = buildPageMetadata(
  'Printable awareness flyers — Protect Ontario',
  'Printable flyers on Doug Ford government cuts, privatization, and accountability — free to print and share.',
)

export default function FlyerLayout({ children }: { children: React.ReactNode }) {
  return children
}
