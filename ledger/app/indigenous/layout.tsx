import hubData from '../../public/data/indigenous-hub.json'
import IndigenousHubShell from '@/components/indigenous/IndigenousHubShell'
import { parseIndigenousHubFile } from '@/lib/indigenous-hub'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata = buildPageMetadata(
  'Indigenous Land & Water Hub — Protect Ontario',
  'Discover and support Indigenous-led land defence, Land Back, treaty rights, and environmental protection campaigns across Canada — official links only.'
)

export default function IndigenousHubLayout({ children }: { children: React.ReactNode }) {
  const hub = parseIndigenousHubFile(hubData)
  return (
    <IndigenousHubShell disclaimer={hub.disclaimer} lastUpdated={hub.lastUpdated}>
      {children}
    </IndigenousHubShell>
  )
}
