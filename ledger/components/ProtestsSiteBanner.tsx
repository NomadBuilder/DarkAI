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

  return (
    <div className="w-full bg-[#9f1239] text-white border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <a
          href={bannerHref}
          className="flex min-h-[40px] items-center justify-center text-center text-xs sm:text-sm font-medium leading-snug tracking-wide hover:underline underline-offset-4 px-2 py-2"
        >
          {campaign.label}
          <span className="hidden sm:inline"> — View events</span>
        </a>
      </div>
    </div>
  )
}
