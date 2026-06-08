import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Join us — Protect Ontario',
  description:
    'Request a sign, volunteer, host a drop-off, or send another request. Volunteer-led organizing across Ontario.',
}

export default function GetInvolvedLayout({ children }: { children: React.ReactNode }) {
  return children
}
