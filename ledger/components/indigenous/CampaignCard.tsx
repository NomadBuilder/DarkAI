import Link from 'next/link'
import type { IndigenousCampaign } from '@/lib/indigenous-hub'
import {
  CAMPAIGN_ISSUE_LABELS,
  CAMPAIGN_STATUS_LABELS,
  PROVINCE_LABELS,
  indigenousHubPath,
} from '@/lib/indigenous-hub'

export default function CampaignCard({ campaign }: { campaign: IndigenousCampaign }) {
  return (
    <article className="group flex flex-col rounded-2xl border border-[#1a4d3a]/12 bg-white shadow-sm shadow-[#1a4d3a]/5 overflow-hidden hover:border-[#1a4d3a]/25 hover:shadow-md transition-all">
      <div className="h-1.5 bg-gradient-to-r from-[#1a4d3a] via-[#3d7a57] to-[#c4a574]" aria-hidden />
      <div className="flex flex-col flex-1 p-5 sm:p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs uppercase tracking-wider text-[#1a4d3a] bg-[#1a4d3a]/8 px-2 py-0.5 rounded-full">
            {CAMPAIGN_STATUS_LABELS[campaign.status]}
          </span>
          {campaign.provinces.slice(0, 2).map((p) => (
            <span key={p} className="text-xs text-[#5a7a66] bg-[#f4f7f2] px-2 py-0.5 rounded-full">
              {PROVINCE_LABELS[p]}
            </span>
          ))}
        </div>
        <h3 className="text-lg sm:text-xl font-light text-[#142818] group-hover:text-[#1a4d3a] transition-colors">
          <Link href={indigenousHubPath('campaigns', campaign.slug)} className="after:absolute relative">
            {campaign.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-[#5a7a66]">{campaign.nations.join(' · ')}</p>
        <p className="mt-3 text-sm sm:text-base text-[#3d5c48] font-light leading-relaxed flex-1">
          {campaign.summary}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {campaign.issues.slice(0, 3).map((issue) => (
            <span key={issue} className="text-xs text-[#3d7a57] border border-[#3d7a57]/25 px-2 py-0.5 rounded-md">
              {CAMPAIGN_ISSUE_LABELS[issue]}
            </span>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-[#1a4d3a]/8 flex items-center justify-between gap-3">
          <Link
            href={indigenousHubPath('campaigns', campaign.slug)}
            className="text-sm text-[#1a4d3a] font-medium hover:underline underline-offset-2"
          >
            Read more →
          </Link>
          {campaign.officialSite && (
            <a
              href={campaign.officialSite.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#5a7a66] hover:text-[#1a4d3a] underline underline-offset-2"
            >
              Official site ↗
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
