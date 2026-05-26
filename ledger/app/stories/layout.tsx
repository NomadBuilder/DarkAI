import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Community voices — Your stories',
  description:
    'Stories from Ontarians about public services, the environment, and accountability. Share yours in a few sentences.',
}

export default function StoriesLayout({ children }: { children: React.ReactNode }) {
  return children
}
