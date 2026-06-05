import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Social post ideas — Protect Ontario',
  description:
    'Ready-to-make graphics, memes, and captions for Facebook, Instagram, and more—each focused on a different Ford issue with #FightFord.',
}

export default function SocialIdeasLayout({ children }: { children: React.ReactNode }) {
  return children
}
