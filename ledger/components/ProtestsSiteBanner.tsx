'use client'

import { useEffect, useState } from 'react'
import { getPublicDataFile } from '../utils/dataPath'
import { parseProtestsFile, type FeaturedCampaign } from '../lib/protests'

function getNavHref(href: string, basePath: string): string {
  const cleanHref = href.startsWith('/') ? href.slice(1) : href
  return basePath ? `${basePath}/${cleanHref}` : `/${cleanHref}`
}

export default function ProtestsSiteBanner({ basePath = '' }: { basePath?: string }) {
  const [campaign, setCampaign] = useState<FeaturedCampaign | null>(null)

  useEffect(() => {
    fetch(getPublicDataFile('protests.json'), { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const file = parseProtestsFile(data)
        const fc = file.featuredCampaign
        if (fc?.enabled && fc.label?.trim()) setCampaign(fc)
      })
      .catch(() => {})
  }, [])

  if (!campaign) return null

  const protestsHref = getNavHref('/protests', basePath)
  const hash = campaign.href?.startsWith('#') ? campaign.href : '#event-list'
  const bannerHref = `${protestsHref}${hash}`
  const signHref = `${getNavHref('/join', basePath)}#download-a-sign`

  return (
    <div className="w-full bg-[#9f1239] text-white border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[40px] flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2 text-center text-xs sm:text-sm font-medium leading-snug tracking-wide">
          <a href={bannerHref} className="hover:underline underline-offset-4">
            {campaign.label}
            <span className="hidden sm:inline"> — Find your city</span>
          </a>
          <span className="text-white/50" aria-hidden>
            ·
          </span>
          <a href={signHref} className="text-white/90 hover:text-white hover:underline underline-offset-4">
            Get a sign
          </a>
        </div>
      </div>
    </div>
  )
}
