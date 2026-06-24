import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata: Metadata = buildPageMetadata(
  'Healthcare — Protect Ontario',
  'How public healthcare dollars in Ontario are shifting toward private delivery — staffing, waits, and documented spending.'
)

export default function HealthcareLayout({ children }: { children: React.ReactNode }) {
  return children
}
