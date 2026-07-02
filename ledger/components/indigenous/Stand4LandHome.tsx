'use client'

import { useState } from 'react'
import Link from 'next/link'
import CampaignCard from '@/components/indigenous/CampaignCard'
import MapPreview from '@/components/indigenous/MapPreview'
import type { IndigenousCampaign } from '@/lib/indigenous-hub'
import { indigenousHubPath } from '@/lib/indigenous-hub'
import { HUB_LAND_HERO } from '@/lib/hub-land-images'

type Stand4LandHomeProps = {
  campaigns: IndigenousCampaign[]
  featured: IndigenousCampaign[]
}

export default function Stand4LandHome({ campaigns, featured }: Stand4LandHomeProps) {
  const [heroFailed, setHeroFailed] = useState(false)

  return (
    <>
      <section className="hub-land-hero relative overflow-hidden">
        {!heroFailed ? (
          <img
            src={HUB_LAND_HERO.url}
            alt={HUB_LAND_HERO.alt ?? ''}
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            onError={() => setHeroFailed(true)}
          />
        ) : (
          <div
            className="absolute inset-0 hub-land-media-fallback bg-gradient-to-br from-[#1a3d2e] via-[#2d4a36] to-[#3d5c5a]"
            aria-hidden
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1c2419]/75 via-[#1c2419]/55 to-[#1c2419]/85" />
        <div className="relative px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 md:pt-24 pb-20 md:pb-28">
          <div className="max-w-4xl mx-auto text-center">
            <p className="hub-display text-sm sm:text-base tracking-[0.2em] uppercase text-[#e8dfd0]/90 mb-4">
              Land &amp; water defence
            </p>
            <h1 className="hub-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.06]">
              Standing for the Land
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-[#e8f0e4]/90 max-w-2xl mx-auto leading-relaxed">
              Find active campaigns, connect with official channels, and support Nations directly.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3 sm:gap-4">
              <Link
                href={indigenousHubPath('campaigns')}
                className="rounded-lg bg-[#e8dfd0] px-6 py-3.5 text-sm sm:text-base font-medium text-[#1c2419] hover:bg-white transition-colors"
              >
                Browse campaigns
              </Link>
              <Link
                href={indigenousHubPath('map')}
                className="rounded-lg border border-white/40 px-6 py-3.5 text-sm sm:text-base text-white hover:bg-white/10 transition-colors"
              >
                View map
              </Link>
              <Link
                href={indigenousHubPath('learn')}
                className="rounded-lg border border-white/40 px-6 py-3.5 text-sm sm:text-base text-white hover:bg-white/10 transition-colors"
              >
                Learning centre
              </Link>
            </div>
            {!heroFailed && (
              <p className="mt-8 text-xs text-white/50">{HUB_LAND_HERO.credit}</p>
            )}
          </div>
        </div>
      </section>

      <MapPreview campaigns={campaigns} />

      <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-20 hub-land-section-alt border-y">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <h2 className="hub-display text-2xl sm:text-3xl font-semibold text-[var(--hub-land-ink)]">
                Featured campaigns
              </h2>
              <p className="mt-2 text-[var(--hub-land-muted)]">Frontline defence, legal challenges, and Land Back.</p>
            </div>
            <Link
              href={indigenousHubPath('campaigns')}
              className="text-sm text-[var(--hub-land-forest)] hover:underline shrink-0"
            >
              View all {campaigns.length} campaigns →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <CampaignCard key={c.slug} campaign={c} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="max-w-6xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: indigenousHubPath('organizations'), title: 'Organizations', desc: 'Indigenous-led groups & legal advocates' },
            { href: indigenousHubPath('learn'), title: 'Learn', desc: 'Land Back, IPCAs, treaties & FPIC' },
            { href: indigenousHubPath('news'), title: 'News', desc: 'Trusted Indigenous-led & independent sources' },
            { href: indigenousHubPath('support'), title: 'Support', desc: 'Donate, volunteer & take action — officially' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hub-land-card rounded-xl border p-6 hover:shadow-lg transition-all group block"
            >
              <h3 className="hub-display text-lg font-semibold text-[var(--hub-land-ink)] group-hover:text-[var(--hub-land-forest)]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-[var(--hub-land-muted)]">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-16 md:pb-20">
        <div className="max-w-6xl mx-auto rounded-2xl bg-[var(--hub-land-forest)] text-[#e8f0e4] p-6 sm:p-8">
          <h2 className="hub-display text-xl sm:text-2xl font-semibold mb-3">Ontario-specific action</h2>
          <p className="text-sm sm:text-base leading-relaxed opacity-90">
            Protect Ontario covers Ford government policy affecting Indigenous rights in Ontario — Bill 5, Ring of Fire,
            and free, prior and informed consent.{' '}
            <Link href="/indigenous-rights/" className="underline underline-offset-2 hover:opacity-100">
              Read our Indigenous rights page →
            </Link>
          </p>
        </div>
      </section>
    </>
  )
}
