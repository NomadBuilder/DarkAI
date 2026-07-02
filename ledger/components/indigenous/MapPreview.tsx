'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { IndigenousCampaign } from '@/lib/indigenous-hub'
import { indigenousHubPath } from '@/lib/indigenous-hub'

const CanadaCampaignMap = dynamic(() => import('@/components/indigenous/CanadaCampaignMap'), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-[var(--hub-land-forest)]/15 bg-[var(--hub-land-bg-warm)] flex items-center justify-center h-[240px] sm:h-[280px]">
      <p className="text-sm text-[var(--hub-land-muted)]">Loading map…</p>
    </div>
  ),
})

export default function MapPreview({ campaigns }: { campaigns: IndigenousCampaign[] }) {
  return (
    <section className="relative py-12 md:py-16 hub-land-section-alt border-y">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 max-w-3xl">
          <div>
            <h2 className="hub-display text-2xl sm:text-3xl font-semibold text-[var(--hub-land-ink)]">
              Campaigns across Canada
            </h2>
            <p className="mt-2 text-[var(--hub-land-muted)]">
              Every marker links to an official campaign — explore the land and water being defended.
            </p>
          </div>
          <Link
            href={indigenousHubPath('map')}
            className="text-sm text-[var(--hub-land-forest)] font-medium hover:underline shrink-0"
          >
            Open full map →
          </Link>
        </div>
        <div className="rounded-xl overflow-hidden border border-[var(--hub-land-forest)]/15 shadow-lg">
          <CanadaCampaignMap campaigns={campaigns} compact scrollWheelZoom={false} />
        </div>
      </div>
    </section>
  )
}
