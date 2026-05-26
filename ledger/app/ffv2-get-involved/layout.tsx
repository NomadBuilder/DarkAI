import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get involved',
  description:
    'Order signs, host a pickup hub, volunteer, donate, or share ideas. Grassroots sign-up for Ontario.',
  robots: { index: false, follow: false },
}

export default function FfV2GetInvolvedLayout({ children }: { children: React.ReactNode }) {
  return <div className="ffv2-get-involved-route">{children}</div>
}
