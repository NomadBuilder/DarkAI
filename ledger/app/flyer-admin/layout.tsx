import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Flyer editor — Protect Ontario',
  robots: { index: false, follow: false },
}

export default function FlyerAdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
