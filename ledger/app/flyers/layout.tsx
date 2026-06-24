import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Printable awareness flyers — Protect Ontario',
  description:
    'Printable flyers on Doug Ford government cuts, privatization, and accountability — free to print and share.',
  robots: { index: true, follow: true },
}

export default function FlyerLayout({ children }: { children: React.ReactNode }) {
  return children
}
