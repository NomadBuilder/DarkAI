import Link from 'next/link'
import hubData from '../../public/data/indigenous-hub.json'
import CampaignCard from '@/components/indigenous/CampaignCard'
import { parseIndigenousHubFile, indigenousHubPath } from '@/lib/indigenous-hub'

export default function IndigenousHubHomePage() {
  const hub = parseIndigenousHubFile(hubData)
  const featured = hub.campaigns.slice(0, 6)

  return (
    <>
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-20 md:pb-28">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a4d3a]/12 via-[#f4f7f2] to-[#c4a574]/15" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_-10%,rgba(26,77,58,0.12),transparent)]" />
        <div className="relative max-w-5xl mx-auto text-center">
          <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-[#1a4d3a] mb-4 font-medium">
            Indigenous-led · Official sources
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-[#142818] leading-[1.08]">
            Land, water &amp; treaty defence across Canada
          </h1>
          <p className="mt-6 text-lg sm:text-xl md:text-2xl text-[#3d5c48] font-light max-w-3xl mx-auto leading-relaxed">
            Find active campaigns, connect with official channels, and support Indigenous-led movements directly —
            without middlemen.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link
              href={indigenousHubPath('campaigns')}
              className="rounded-xl bg-[#1a4d3a] px-6 py-3.5 text-sm sm:text-base font-medium text-white hover:bg-[#143d2e] transition-colors shadow-lg shadow-[#1a4d3a]/20"
            >
              Browse campaigns
            </Link>
            <Link
              href={indigenousHubPath('map')}
              className="rounded-xl border border-[#1a4d3a]/25 bg-white/80 px-6 py-3.5 text-sm sm:text-base font-light text-[#1a4d3a] hover:bg-white transition-colors"
            >
              View map
            </Link>
            <Link
              href={indigenousHubPath('learn')}
              className="rounded-xl border border-[#1a4d3a]/25 bg-white/80 px-6 py-3.5 text-sm sm:text-base font-light text-[#1a4d3a] hover:bg-white transition-colors"
            >
              Learning centre
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-20 bg-white border-y border-[#1a4d3a]/8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-light text-[#142818]">Featured campaigns</h2>
              <p className="mt-2 text-[#5a7a66] font-light">Frontline defence, legal challenges, and Land Back initiatives.</p>
            </div>
            <Link href={indigenousHubPath('campaigns')} className="text-sm text-[#1a4d3a] hover:underline shrink-0">
              View all {hub.campaigns.length} campaigns →
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
            { href: indigenousHubPath('news'), title: 'News', desc: 'Trusted Indigenous & independent sources' },
            { href: indigenousHubPath('support'), title: 'Support', desc: 'Donate, volunteer & take action — officially' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-[#1a4d3a]/10 bg-[#e8f0e4]/40 p-6 hover:border-[#1a4d3a]/25 hover:bg-white transition-all group"
            >
              <h3 className="text-lg font-light text-[#142818] group-hover:text-[#1a4d3a]">{item.title}</h3>
              <p className="mt-2 text-sm text-[#5a7a66] font-light">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
