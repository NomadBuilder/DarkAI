'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { IndigenousCampaign } from '@/lib/indigenous-hub'
import { indigenousHubPath } from '@/lib/indigenous-hub'

const CanadaCampaignMap = dynamic(() => import('@/components/indigenous/CanadaCampaignMap'), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-[#1a4d3a]/12 bg-[#e8f0e4] flex items-center justify-center h-[240px] sm:h-[280px]">
      <p className="text-sm text-[#5a7a66] font-light">Loading map…</p>
    </div>
  ),
})

export default function MapPreview({ campaigns }: { campaigns: IndigenousCampaign[] }) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-16 border-y border-[#1a4d3a]/8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 max-w-3xl">
          <div>
            <h2 className="text-2xl sm:text-3xl font-light text-[#142818]">Campaigns across Canada</h2>
            <p className="mt-2 text-[#5a7a66] font-light">
              Explore active land and water defence — every marker links to an official campaign.
            </p>
          </div>
          <Link
            href={indigenousHubPath('map')}
            className="text-sm text-[#1a4d3a] font-medium hover:underline shrink-0"
          >
            Open full map →
          </Link>
        </div>
        <CanadaCampaignMap campaigns={campaigns} compact scrollWheelZoom={false} />
      </div>
    </section>
  )
}
