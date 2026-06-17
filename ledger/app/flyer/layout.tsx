import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Printable awareness flyer — Protect Ontario',
  description:
    'Printable flyer on Doug Ford government cuts, privatization, and accountability — share in your community.',
  robots: { index: true, follow: true },
}

export default function FlyerLayout({ children }: { children: React.ReactNode }) {
  return <div className="flyer-route">{children}</div>
}
