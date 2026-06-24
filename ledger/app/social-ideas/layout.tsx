import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Social post ideas — Protect Ontario',
  description:
    'Ready-to-share captions and graphics for Facebook, Instagram, and more — copy posts with #FightFord and link to flyers, facts, and protests.',
}

export default function SocialIdeasLayout({ children }: { children: React.ReactNode }) {
  return children
}
