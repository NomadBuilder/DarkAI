import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Materials — Protect Ontario',
  description:
    'Protest signs, shirt transfers, stickers, and printable materials for Ontario demonstrations.',
}

export default function MaterialsLayout({ children }: { children: React.ReactNode }) {
  return children
}
