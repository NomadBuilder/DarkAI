import { Fraunces, Lora } from 'next/font/google'
import hubData from '../../public/data/indigenous-hub.json'
import HubLayoutSwitch from '@/components/indigenous/HubLayoutSwitch'
import { HUB_SITE_NAME, parseIndigenousHubFile } from '@/lib/indigenous-hub'
import { buildHubPageMetadata } from '@/lib/page-metadata'
import '@/components/indigenous/hub-land.css'

const hubDisplay = Fraunces({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-hub-display',
  display: 'swap',
})

const hubBody = Lora({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-hub-body',
  display: 'swap',
})

export const metadata = buildHubPageMetadata(
  `${HUB_SITE_NAME} — Protect Ontario`,
  'Discover Indigenous-led land defence campaigns — Land Back, treaty rights, and environmental protection across Canada. Official links only.'
)

export default function IndigenousHubLayout({ children }: { children: React.ReactNode }) {
  const hub = parseIndigenousHubFile(hubData)
  return (
    <div className={`hub-theme-land min-h-full ${hubDisplay.variable} ${hubBody.variable}`}>
      <HubLayoutSwitch lastUpdated={hub.lastUpdated || undefined}>{children}</HubLayoutSwitch>
    </div>
  )
}
