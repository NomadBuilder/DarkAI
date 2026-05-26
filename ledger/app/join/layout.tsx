import type { Metadata } from 'next'
import JoinSiteChrome from '@/components/join/JoinSiteChrome'

export const metadata: Metadata = {
  title: 'Get involved',
  description:
    'Order signs, host a pickup hub, volunteer, donate, or share ideas. Grassroots sign-up for Ontario.',
  robots: { index: false, follow: false },
}

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="join-route">
      <JoinSiteChrome>{children}</JoinSiteChrome>
    </div>
  )
}
