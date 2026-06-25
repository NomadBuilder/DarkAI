import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Social post ideas — Protect Ontario',
  robots: { index: false, follow: false },
}

export default function SocialIdeasLayout({ children }: { children: React.ReactNode }) {
  return children
}
