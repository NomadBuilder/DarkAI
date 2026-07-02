'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { IndigenousCampaign } from '@/lib/indigenous-hub'
import { CAMPAIGN_STATUS_LABELS, indigenousHubPath } from '@/lib/indigenous-hub'
import CanadaCampaignMap from './CanadaCampaignMap'

export default function MapPageClient({
  campaigns,
}: {
  campaigns: IndigenousCampaign[]
}) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const selected = selectedSlug ? campaigns.find((c) => c.slug === selectedSlug) : null

  return (
    <div className="grid gap-6 lg:gap-8 lg:grid-cols-5">
      <div className="lg:col-span-3 min-w-0">
        <CanadaCampaignMap campaigns={campaigns} selectedSlug={selectedSlug} onSelect={setSelectedSlug} />
      </div>
      <div className="lg:col-span-2 min-w-0">
        {selected ? (
          <div className="rounded-2xl border border-[#1a4d3a]/12 bg-white p-4 sm:p-6 shadow-sm lg:sticky lg:top-24">
            <p className="text-xs uppercase tracking-wider text-[#1a4d3a]">{CAMPAIGN_STATUS_LABELS[selected.status]}</p>
            <h2 className="text-xl font-light text-[#142818] mt-1">{selected.title}</h2>
            <p className="text-sm text-[#3d7a57] mt-1">{selected.nations.join(' · ')}</p>
            <p className="text-sm text-[#3d5c48] font-light leading-relaxed mt-4">{selected.summary}</p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href={indigenousHubPath('campaigns', selected.slug)}
                className="text-sm font-medium text-[#1a4d3a] hover:underline"
              >
                Full campaign page →
              </Link>
              {selected.officialSite && (
                <a
                  href={selected.officialSite.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#5a7a66] hover:underline"
                >
                  Official site ↗
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#1a4d3a]/20 bg-[#e8f0e4]/50 p-4 sm:p-6 text-center lg:sticky lg:top-24">
            <p className="text-sm text-[#5a7a66] font-light">
              Click a marker on the map to see campaign details and support links.
            </p>
          </div>
        )}
        <ul className="mt-4 sm:mt-6 space-y-2 max-h-none lg:max-h-[280px] lg:overflow-y-auto">
          {campaigns.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                onClick={() => setSelectedSlug(c.slug)}
                className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                  selectedSlug === c.slug ? 'bg-[#1a4d3a] text-white' : 'hover:bg-[#1a4d3a]/8 text-[#3d5c48]'
                }`}
              >
                {c.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
