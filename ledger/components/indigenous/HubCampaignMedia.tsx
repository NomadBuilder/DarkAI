'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import type { IndigenousCampaign } from '@/lib/indigenous-hub'
import { getCampaignLandFallback, getCampaignLandImage } from '@/lib/hub-land-images'

type HubCampaignMediaProps = {
  campaign: IndigenousCampaign
  variant?: 'card' | 'detail'
  overlay?: ReactNode
  className?: string
}

export default function HubCampaignMedia({
  campaign,
  variant = 'card',
  overlay,
  className = '',
}: HubCampaignMediaProps) {
  const image = getCampaignLandImage(campaign.slug)
  const fallback = getCampaignLandFallback(campaign)
  const [photoFailed, setPhotoFailed] = useState(false)
  const showPhoto = Boolean(image?.url) && !photoFailed

  const aspect =
    variant === 'detail'
      ? 'relative aspect-[21/9] min-h-[220px] max-h-[420px]'
      : 'relative aspect-[16/10]'

  return (
    <div className={`${aspect} overflow-hidden ${className}`}>
      {showPhoto ? (
        <>
          <img
            src={image!.url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading={variant === 'detail' ? 'eager' : 'lazy'}
            onError={() => setPhotoFailed(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c2419]/70 via-transparent to-transparent" />
        </>
      ) : (
        <div className={`absolute inset-0 hub-land-media-fallback ${fallback.gradientClass}`} aria-hidden>
          {variant === 'card' && (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <p className="hub-display text-lg sm:text-xl text-white/80 font-semibold text-center leading-snug max-w-[14rem]">
                {fallback.label}
              </p>
            </div>
          )}
        </div>
      )}
      {overlay}
    </div>
  )
}
