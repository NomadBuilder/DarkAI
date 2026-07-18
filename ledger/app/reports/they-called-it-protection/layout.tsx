import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata: Metadata = buildPageMetadata(
  'Protect Ontario accountability brief — ProtectOnt',
  'MPP votes on the Protect Ontario bills — plus OLA expense disclosure in the postal lookup: species-law rollbacks, special economic zones, water corporations, and budget omnibuses.'
)

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
