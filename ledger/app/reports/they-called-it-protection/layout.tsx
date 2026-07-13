import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata: Metadata = buildPageMetadata(
  'Protect Ontario accountability brief — ProtectOnt',
  'MPP votes on the Protect Ontario bills: species-law rollbacks, special economic zones, water corporations, and budget omnibuses — plus a postal lookup for Yes / No / No Show.'
)

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
