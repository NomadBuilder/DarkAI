'use client'

import { useState } from 'react'
import type { IndigenousCampaign } from '@/lib/indigenous-hub'
import { hubCampaignShareText, hubCampaignShareUrl } from '@/lib/hub-campaign-utils'

type HubCampaignShareProps = {
  campaign: IndigenousCampaign
  pageUrl: string
  className?: string
}

export default function HubCampaignShare({ campaign, pageUrl, className = '' }: HubCampaignShareProps) {
  const [copied, setCopied] = useState(false)
  const shareText = hubCampaignShareText(campaign)
  const shareUrl = hubCampaignShareUrl(campaign)

  async function handleShare() {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: campaign.title,
          text: shareText,
          url: shareUrl,
        })
        return
      }
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      /* user cancelled share sheet */
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleShare()}
      className={`inline-flex items-center gap-2 rounded-lg border border-[var(--hub-land-forest)]/25 px-4 py-2.5 text-sm text-[var(--hub-land-forest)] hover:bg-[var(--hub-land-forest)]/5 transition-colors ${className}`}
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path strokeLinecap="round" d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v14" />
      </svg>
      {copied ? 'Link copied' : 'Share this campaign'}
    </button>
  )
}
