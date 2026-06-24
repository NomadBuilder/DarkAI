import type { Metadata } from 'next'
import JoinSiteChrome from '@/components/join/JoinSiteChrome'

export const metadata: Metadata = {
  title: 'Join us — Protect Ontario',
  description:
    'Order signs, host a pickup hub, volunteer, donate, or share ideas. Grassroots sign-up for Ontario.',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Join us — Protect Ontario',
    description:
      'Order signs, host a pickup hub, volunteer, donate, or share ideas. Grassroots sign-up for Ontario.',
  },
}

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="join-route pb-14 sm:pb-0">
      <JoinSiteChrome>{children}</JoinSiteChrome>
    </div>
  )
}
