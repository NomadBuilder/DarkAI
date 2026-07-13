import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata: Metadata = buildPageMetadata(
  'They Sold It as Protection — ProtectOnt',
  'Gut species law. Open special economic zones. Push water into corporate shells. Zero PC dissent on the votes that locked it in — plus your MPP’s record on the six bills.'
)

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
