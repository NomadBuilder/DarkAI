import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Update events — Protect Ontario',
  robots: { index: false, follow: false },
}

export default function AdminEventsLayout({ children }: { children: React.ReactNode }) {
  return children
}
