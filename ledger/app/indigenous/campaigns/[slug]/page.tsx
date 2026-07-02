import Link from 'next/link'
import hubData from '../../../../public/data/indigenous-hub.json'
import CampaignDetailView from '@/components/indigenous/CampaignDetailView'
import { getCampaignBySlug, indigenousHubPath, parseIndigenousHubFile } from '@/lib/indigenous-hub'
import { buildPageMetadata } from '@/lib/page-metadata'
import type { Metadata } from 'next'

export function generateStaticParams() {
  const hub = parseIndigenousHubFile(hubData)
  return hub.campaigns.map((c) => ({ slug: c.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const hub = parseIndigenousHubFile(hubData)
  const campaign = getCampaignBySlug(hub, params.slug)
  if (!campaign) {
    return buildPageMetadata('Campaign not found', 'This campaign could not be found.')
  }
  return buildPageMetadata(
    `${campaign.title} — Indigenous Land & Water Hub`,
    campaign.summary.slice(0, 155)
  )
}

export default function IndigenousCampaignPage({ params }: { params: { slug: string } }) {
  const hub = parseIndigenousHubFile(hubData)
  const campaign = getCampaignBySlug(hub, params.slug)

  if (!campaign) {
    return (
      <div className="px-4 py-20 text-center">
        <p className="text-[#5a7a66] mb-4">Campaign not found.</p>
        <Link href={indigenousHubPath('campaigns')} className="text-[#1a4d3a] underline">
          Back to directory
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 max-w-6xl mx-auto">
      <Link
        href={indigenousHubPath('campaigns')}
        className="inline-block text-sm text-[#5a7a66] hover:text-[#1a4d3a] mb-8"
      >
        ← All campaigns
      </Link>
      <CampaignDetailView campaign={campaign} hub={hub} />
    </div>
  )
}
