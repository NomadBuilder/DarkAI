import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata: Metadata = buildPageMetadata(
  'Signs in the wild — Protect Ontario',
  'Upload photos of ProtectOnt and Fight Ford yard signs. Gallery shows FSA-only location — never your full address.'
)

export default function SignsInTheWildLayout({ children }: { children: React.ReactNode }) {
  return children
}
