import hubData from '../../../public/data/indigenous-hub.json'
import CampaignDirectoryClient from '@/components/indigenous/CampaignDirectoryClient'
import { parseIndigenousHubFile } from '@/lib/indigenous-hub'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata = buildPageMetadata(
  'Campaign directory — Indigenous Land & Water Hub',
  'Search Indigenous-led land defence campaigns across Canada by province, issue, and status. Official links only.'
)

export default function IndigenousCampaignsPage() {
  const hub = parseIndigenousHubFile(hubData)
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12 md:py-16 max-w-7xl mx-auto">
      <header className="mb-10 md:mb-14 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#142818]">Campaign directory</h1>
        <p className="mt-4 text-lg text-[#3d5c48] font-light leading-relaxed">
          Active Indigenous-led campaigns for land, water, treaty rights, and environmental protection. Every listing
          links to official Nation or campaign channels.
        </p>
      </header>
      <CampaignDirectoryClient campaigns={hub.campaigns} />
    </div>
  )
}
