import hubData from '../../../public/data/indigenous-hub.json'
import MapPageClient from '@/components/indigenous/MapPageClient'
import { parseIndigenousHubFile } from '@/lib/indigenous-hub'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata = buildPageMetadata(
  'Campaign map — Indigenous Land & Water Hub',
  'Interactive map of Indigenous-led land defence and environmental protection campaigns across Canada.'
)

export default function IndigenousMapPage() {
  const hub = parseIndigenousHubFile(hubData)
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12 md:py-16 max-w-7xl mx-auto">
      <header className="mb-10 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#142818]">Campaign map</h1>
        <p className="mt-4 text-lg text-[#3d5c48] font-light leading-relaxed">
          Every marker is an Indigenous-led campaign with official support links. Click to explore, then visit the
          campaign&apos;s own site to donate or volunteer.
        </p>
      </header>
      <MapPageClient campaigns={hub.campaigns} />
    </div>
  )
}
