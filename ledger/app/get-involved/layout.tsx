import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Get involved — Protect Ontario',
  description:
    'Host a drop-off point, volunteer, or get updates. Volunteer-led organizing across Ontario.',
}

export default function GetInvolvedLayout({ children }: { children: React.ReactNode }) {
  return children
}
