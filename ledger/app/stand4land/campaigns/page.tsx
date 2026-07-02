import { Suspense } from 'react'
import hubData from '../../../public/data/indigenous-hub.json'
import CampaignDirectoryClient from '@/components/indigenous/CampaignDirectoryClient'
import { HubPage, HubPageIntro } from '@/components/indigenous/HubPage'
import { parseIndigenousHubFile, hubPageTitle } from '@/lib/indigenous-hub'
import { buildHubPageMetadata } from '@/lib/page-metadata'

export const metadata = buildHubPageMetadata(
  hubPageTitle('Campaign directory'),
  'Search Indigenous-led land defence campaigns across Canada by province, issue, and status. Official campaign channels only.'
)

export default function IndigenousCampaignsPage() {
  const hub = parseIndigenousHubFile(hubData)
  return (
    <HubPage wide>
      <HubPageIntro title="Campaign directory">
        Active Indigenous-led campaigns for land, water, treaty rights, and environmental protection. Every listing
        links to official Nation or campaign channels.
      </HubPageIntro>
      <Suspense fallback={<p className="text-[var(--hub-land-muted)]">Loading campaigns…</p>}>
        <CampaignDirectoryClient campaigns={hub.campaigns} />
      </Suspense>
    </HubPage>
  )
}
