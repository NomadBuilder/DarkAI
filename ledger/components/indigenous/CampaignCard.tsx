'use client'

import Link from 'next/link'
import HubCampaignMedia from '@/components/indigenous/HubCampaignMedia'
import type { IndigenousCampaign } from '@/lib/indigenous-hub'
import {
  CAMPAIGN_ISSUE_LABELS,
  CAMPAIGN_STATUS_LABELS,
  PROVINCE_LABELS,
  indigenousHubPath,
} from '@/lib/indigenous-hub'
import { getCampaignLandImage } from '@/lib/hub-land-images'

export default function CampaignCard({ campaign }: { campaign: IndigenousCampaign }) {
  const image = getCampaignLandImage(campaign.slug)
  const detailHref = indigenousHubPath('campaigns', campaign.slug)

  return (
    <article className="group relative flex flex-col hub-land-card rounded-xl border overflow-hidden hover:shadow-lg transition-all">
      <HubCampaignMedia
        campaign={campaign}
        variant="card"
        overlay={
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2 z-10">
            <span className="text-xs uppercase tracking-wider text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded">
              {CAMPAIGN_STATUS_LABELS[campaign.status]}
            </span>
            {campaign.provinces.slice(0, 1).map((p) => (
              <span key={p} className="text-xs text-white/90 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded">
                {PROVINCE_LABELS[p]}
              </span>
            ))}
          </div>
        }
      />
      <div className="flex flex-col flex-1 p-5 sm:p-6">
        <h3 className="hub-display text-lg sm:text-xl font-semibold text-[var(--hub-land-ink)] group-hover:text-[var(--hub-land-forest)] transition-colors">
          <Link href={detailHref} className="after:absolute relative">
            {campaign.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-[var(--hub-land-muted)]">{campaign.nations.join(' · ')}</p>
        <p className="mt-3 text-sm sm:text-base text-[var(--hub-land-muted)] leading-relaxed flex-1 line-clamp-3">
          {campaign.summary}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {campaign.issues.slice(0, 3).map((issue) => (
            <span key={issue} className="text-xs text-[var(--hub-land-river)] border-b border-[var(--hub-land-river)]/30 pb-0.5">
              {CAMPAIGN_ISSUE_LABELS[issue]}
            </span>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-[var(--hub-land-forest)]/10 flex items-center justify-between gap-3">
          <Link
            href={detailHref}
            className="text-sm text-[var(--hub-land-forest)] font-medium hover:underline underline-offset-2"
          >
            Read more →
          </Link>
          {campaign.officialSite && (
            <a
              href={campaign.officialSite.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--hub-land-muted)] hover:text-[var(--hub-land-forest)] underline underline-offset-2"
            >
              Official site ↗
            </a>
          )}
        </div>
        {image?.credit && (
          <p className="mt-2 text-[10px] text-[var(--hub-land-muted)]/70 line-clamp-1">{image.credit}</p>
        )}
      </div>
    </article>
  )
}
