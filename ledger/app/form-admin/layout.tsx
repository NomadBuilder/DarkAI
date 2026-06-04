import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Join form editor — Protect Ontario',
  robots: { index: false, follow: false },
}

export default function FormAdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
