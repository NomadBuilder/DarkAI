import Link from 'next/link'
import hubData from '../../../public/data/indigenous-hub.json'
import { indigenousHubPath, parseIndigenousHubFile } from '@/lib/indigenous-hub'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata = buildPageMetadata(
  'How to support — Indigenous Land & Water Hub',
  'Donate, volunteer, and share resources — always through official Indigenous-led campaign channels.'
)

export default function IndigenousSupportPage() {
  const hub = parseIndigenousHubFile(hubData)

  const withDonate = hub.campaigns.filter((c) => c.donate?.length)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 max-w-4xl mx-auto">
      <header className="mb-10 md:mb-14">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#142818]">How you can help</h1>
        <p className="mt-4 text-lg text-[#3d5c48] font-light leading-relaxed">
          The most effective support goes directly to Nations and campaigns — not through third-party fundraisers. We
          never collect donations on behalf of movements listed here.
        </p>
      </header>

      <div className="space-y-8">
        {[
          {
            title: 'Donate through official channels',
            body: 'Each campaign page lists verified donation links — legal funds, Land Back trusts, and frontline camp costs. If a link is not on the official campaign website or their verified social accounts, do not trust it.',
          },
          {
            title: 'Buy official merchandise',
            body: 'Some campaigns sell merch to fund their work. Purchase only from links on official campaign or Nation websites.',
          },
          {
            title: 'Volunteer & show up',
            body: 'Rallies, blockades, and community gatherings are announced on official campaign sites and Nation channels. Follow Nation-led safety guidance and respect protocols on the land.',
          },
          {
            title: 'Contact elected representatives',
            body: 'Pressure on provincial and federal governments matters — but centre Indigenous voices. Share campaign materials from official sources; do not speak over Nations.',
          },
          {
            title: 'Learn & share responsibly',
            body: 'Use our learning centre to understand Land Back, FPIC, and treaties — then share links to official campaign pages, not reworded summaries that erase Nation leadership.',
          },
        ].map((item) => (
          <section key={item.title} className="rounded-2xl border border-[#1a4d3a]/10 bg-white p-6 sm:p-8">
            <h2 className="text-xl font-light text-[#142818]">{item.title}</h2>
            <p className="mt-3 text-[#3d5c48] font-light leading-relaxed">{item.body}</p>
          </section>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-xl sm:text-2xl font-light text-[#142818] mb-6">Campaigns accepting donations</h2>
        <ul className="space-y-3">
          {withDonate.map((c) => (
            <li key={c.slug} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-[#1a4d3a]/10 bg-[#f4f7f2]/50 px-4 py-3">
              <Link href={indigenousHubPath('campaigns', c.slug)} className="text-[#142818] hover:text-[#1a4d3a] font-light">
                {c.title}
              </Link>
              {c.donate?.[0] && (
                <a
                  href={c.donate[0].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#1a4d3a] font-medium hover:underline shrink-0"
                >
                  Donate (official) ↗
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 rounded-2xl bg-[#1a4d3a] text-[#e8f0e4] p-6 sm:p-8">
        <h2 className="text-xl font-light mb-3">Ontario-specific action</h2>
        <p className="text-sm font-light opacity-90 leading-relaxed">
          Protect Ontario covers Ford government policy affecting Indigenous rights in Ontario — Bill 5, Ring of Fire,
          and FPIC.{' '}
          <Link href="/indigenous-rights/" className="underline underline-offset-2 hover:opacity-100">
            Read our Indigenous rights page →
          </Link>
        </p>
      </section>
    </div>
  )
}
