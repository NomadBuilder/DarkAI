import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home (preview) — Protect Ontario',
  description:
    'Preview homepage that flows with the get-involved page. Not indexed; the live homepage remains at /.',
  robots: { index: false, follow: false },
}

export default function HomePreviewLayout({ children }: { children: React.ReactNode }) {
  return children
}
