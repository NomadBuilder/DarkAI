import Link from 'next/link'
import hubData from '../../../../public/data/indigenous-hub.json'
import CampaignDetailView from '@/components/indigenous/CampaignDetailView'
import HubBreadcrumbs from '@/components/indigenous/HubBreadcrumbs'
import HubCampaignJsonLd from '@/components/indigenous/HubCampaignJsonLd'
import { HubPage } from '@/components/indigenous/HubPage'
import { getCampaignBySlug, indigenousHubPath, parseIndigenousHubFile, hubPageTitle } from '@/lib/indigenous-hub'
import { buildCampaignPageMetadata, buildHubPageMetadata } from '@/lib/page-metadata'
import type { Metadata } from 'next'

export function generateStaticParams() {
  const hub = parseIndigenousHubFile(hubData)
  return hub.campaigns.map((c) => ({ slug: c.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const hub = parseIndigenousHubFile(hubData)
  const campaign = getCampaignBySlug(hub, params.slug)
  if (!campaign) {
    return buildHubPageMetadata('Campaign not found', 'This campaign could not be found.')
  }
  return buildCampaignPageMetadata(
    hubPageTitle(campaign.title),
    campaign.summary.slice(0, 155),
    campaign.slug
  )
}

export default function IndigenousCampaignPage({ params }: { params: { slug: string } }) {
  const hub = parseIndigenousHubFile(hubData)
  const campaign = getCampaignBySlug(hub, params.slug)

  if (!campaign) {
    return (
      <HubPage>
        <p className="text-[#5a7a66] mb-4">Campaign not found.</p>
        <Link href={indigenousHubPath('campaigns')} className="text-[#1a4d3a] underline">
          Back to directory
        </Link>
      </HubPage>
    )
  }

  return (
    <HubPage>
      <HubCampaignJsonLd campaign={campaign} />
      <HubBreadcrumbs
        items={[
          { label: 'Campaigns', href: indigenousHubPath('campaigns') },
          { label: campaign.title },
        ]}
      />
      <CampaignDetailView campaign={campaign} hub={hub} />
    </HubPage>
  )
}
