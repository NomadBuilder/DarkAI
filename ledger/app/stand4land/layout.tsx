import { Fraunces, Lora } from 'next/font/google'
import hubData from '../../public/data/indigenous-hub.json'
import IndigenousHubShell from '@/components/indigenous/IndigenousHubShell'
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
  'Discover and support Indigenous-led land defence, Land Back, treaty rights, and environmental protection campaigns across Canada — official links only.'
)

export default function IndigenousHubLayout({ children }: { children: React.ReactNode }) {
  const hub = parseIndigenousHubFile(hubData)
  return (
    <div className={`hub-theme-land min-h-full ${hubDisplay.variable} ${hubBody.variable}`}>
      <IndigenousHubShell lastUpdated={hub.lastUpdated || undefined}>{children}</IndigenousHubShell>
    </div>
  )
}
