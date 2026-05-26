import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your stories',
  description:
    'Share how Doug Ford’s policies have affected you and why you want change. Short community stories from Ontarians.',
}

export default function StoriesLayout({ children }: { children: React.ReactNode }) {
  return children
}
