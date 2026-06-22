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
      <div className="max-w-7xl mx-auto">
        <a
          href={bannerHref}
          className="flex h-10 items-center justify-center px-4 text-center text-xs font-medium leading-tight tracking-wide hover:underline underline-offset-2 sm:h-11 sm:text-sm"
        >
          {campaign.label}
        </a>
      </div>
    </div>
  )
}
