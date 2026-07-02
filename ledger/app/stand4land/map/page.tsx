import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import hubData from '../../../public/data/indigenous-hub.json'
import { HubPage, HubPageIntro } from '@/components/indigenous/HubPage'
import { parseIndigenousHubFile, hubPageTitle } from '@/lib/indigenous-hub'
import { buildHubPageMetadata } from '@/lib/page-metadata'

const MapPageClient = dynamic(() => import('@/components/indigenous/MapPageClient'), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-[#1a4d3a]/12 bg-[#e8f0e4] flex items-center justify-center min-h-[420px]">
      <p className="text-sm text-[#5a7a66] font-light">Loading map…</p>
    </div>
  ),
})

export const metadata = buildHubPageMetadata(
  hubPageTitle('Campaign map'),
  'Interactive map of Nation-led land defence and environmental protection campaigns across Canada.'
)

export default function IndigenousMapPage() {
  const hub = parseIndigenousHubFile(hubData)
  return (
    <HubPage wide>
      <HubPageIntro title="Campaign map">
        Every marker is a Nation-led campaign with official support links. Click to explore, then visit the
        campaign&apos;s own site to donate or volunteer.
      </HubPageIntro>
      <Suspense fallback={<p className="text-[var(--hub-land-muted)]">Loading map…</p>}>
        <MapPageClient campaigns={hub.campaigns} />
      </Suspense>
    </HubPage>
  )
}
