import type { IndigenousCampaign } from '@/lib/indigenous-hub'
import { buildCampaignJsonLd } from '@/lib/hub-campaign-utils'

export default function HubCampaignJsonLd({ campaign }: { campaign: IndigenousCampaign }) {
  const { organization, events } = buildCampaignJsonLd(campaign)
  const graph = [organization, ...events]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }) }}
    />
  )
}
