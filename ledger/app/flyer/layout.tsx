import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Redirecting…',
  robots: { index: false, follow: true },
}

export default function FlyerLegacyLayout({ children }: { children: React.ReactNode }) {
  return children
}
