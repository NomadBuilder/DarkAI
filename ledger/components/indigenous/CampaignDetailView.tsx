import Link from 'next/link'
import type { HubLink, IndigenousCampaign, IndigenousHubFile } from '@/lib/indigenous-hub'
import {
  CAMPAIGN_ISSUE_LABELS,
  CAMPAIGN_STATUS_LABELS,
  PROVINCE_LABELS,
  getCampaignBySlug,
  indigenousHubPath,
} from '@/lib/indigenous-hub'

function LinkSection({ title, links }: { title: string; links?: HubLink[] }) {
  if (!links?.length) return null
  return (
    <section className="rounded-2xl border border-[#1a4d3a]/10 bg-white p-6 sm:p-8">
      <h2 className="text-lg sm:text-xl font-light text-[#142818] mb-4">{title}</h2>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <a
              href={link.href}
              target={link.href.startsWith('mailto:') ? undefined : '_blank'}
              rel={link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
              className="text-[#1a4d3a] font-medium hover:underline underline-offset-2"
            >
              {link.label} {link.href.startsWith('mailto:') ? '' : '↗'}
            </a>
            {link.note && <p className="text-sm text-[#5a7a66] font-light mt-0.5">{link.note}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default function CampaignDetailView({
  campaign,
  hub,
}: {
  campaign: IndigenousCampaign
  hub: IndigenousHubFile
}) {
  const related = (campaign.relatedSlugs ?? [])
    .map((slug) => getCampaignBySlug(hub, slug))
    .filter(Boolean) as IndigenousCampaign[]

  return (
    <article>
      <header className="mb-10 md:mb-14">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs uppercase tracking-wider text-white bg-[#1a4d3a] px-3 py-1 rounded-full">
            {CAMPAIGN_STATUS_LABELS[campaign.status]}
          </span>
          {campaign.provinces.map((p) => (
            <span key={p} className="text-xs text-[#1a4d3a] bg-[#1a4d3a]/8 px-3 py-1 rounded-full">
              {PROVINCE_LABELS[p]}
            </span>
          ))}
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#142818] leading-tight">{campaign.title}</h1>
        <p className="mt-3 text-lg text-[#3d7a57]">{campaign.nations.join(' · ')}</p>
        <p className="mt-6 text-lg sm:text-xl text-[#3d5c48] font-light leading-relaxed max-w-3xl">{campaign.summary}</p>
        {campaign.officialSite && (
          <a
            href={campaign.officialSite.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex mt-6 items-center gap-2 rounded-xl bg-[#1a4d3a] px-5 py-3 text-sm font-medium text-white hover:bg-[#143d2e] transition-colors"
          >
            Official campaign site ↗
          </a>
        )}
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl sm:text-2xl font-light text-[#142818] mb-4">Why it matters</h2>
            <p className="text-[#3d5c48] font-light leading-relaxed text-lg">{campaign.whyItMatters}</p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-light text-[#142818] mb-4">Background</h2>
            <p className="text-[#3d5c48] font-light leading-relaxed text-lg">{campaign.background}</p>
            {campaign.perspectives && (
              <p className="mt-4 text-[#3d5c48] font-light leading-relaxed text-lg border-l-4 border-[#c4a574] pl-5">
                {campaign.perspectives}
              </p>
            )}
            {campaign.statusDetail && (
              <p className="mt-4 text-sm text-[#5a7a66] font-light italic">{campaign.statusDetail}</p>
            )}
          </section>

          {campaign.timeline.length > 0 && (
            <section>
              <h2 className="text-xl sm:text-2xl font-light text-[#142818] mb-6">Timeline</h2>
              <ol className="space-y-6 border-l-2 border-[#1a4d3a]/15 pl-6">
                {campaign.timeline.map((ev) => (
                  <li key={`${ev.date}-${ev.title}`} className="relative">
                    <span className="absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-full bg-[#c4a574] ring-4 ring-[#f4f7f2]" />
                    <p className="text-sm font-medium text-[#1a4d3a]">{ev.date}</p>
                    <p className="text-base font-light text-[#142818] mt-0.5">{ev.title}</p>
                    {ev.summary && <p className="text-sm text-[#5a7a66] font-light mt-1">{ev.summary}</p>}
                    {ev.sourceUrl && (
                      <a
                        href={ev.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#3d7a57] hover:underline mt-1 inline-block"
                      >
                        Source: {ev.sourceLabel ?? 'Link'} ↗
                      </a>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="rounded-2xl bg-[#1a4d3a] text-[#e8f0e4] p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-light mb-3">How you can help</h2>
            <p className="text-sm font-light opacity-90 mb-5">
              Support flows directly to official campaign channels — we do not collect donations here.
            </p>
            <div className="flex flex-wrap gap-3">
              {campaign.donate?.[0] && (
                <a
                  href={campaign.donate[0].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-[#c4a574] text-[#142818] px-4 py-2.5 text-sm font-medium hover:bg-[#d4b584] transition-colors"
                >
                  Donate (official) ↗
                </a>
              )}
              {campaign.petitions?.[0] && (
                <a
                  href={campaign.petitions[0].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-light hover:bg-white/10 transition-colors"
                >
                  Petition ↗
                </a>
              )}
              {campaign.volunteer?.[0] && (
                <a
                  href={campaign.volunteer[0].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-light hover:bg-white/10 transition-colors"
                >
                  Volunteer ↗
                </a>
              )}
              <Link
                href={indigenousHubPath('support')}
                className="rounded-xl border border-white/30 px-4 py-2.5 text-sm font-light hover:bg-white/10 transition-colors"
              >
                More ways to help
              </Link>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-[#1a4d3a]/10 bg-white p-5 sm:p-6 sticky top-36">
            <h2 className="text-sm uppercase tracking-wider text-[#5a7a66] mb-3">Issues</h2>
            <div className="flex flex-wrap gap-2">
              {campaign.issues.map((issue) => (
                <span key={issue} className="text-xs text-[#1a4d3a] border border-[#1a4d3a]/20 px-2 py-1 rounded-md">
                  {CAMPAIGN_ISSUE_LABELS[issue]}
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs text-[#5a7a66]">Verified {campaign.lastVerified}</p>
          </div>
        </aside>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <LinkSection title="Donate (official)" links={campaign.donate} />
        <LinkSection title="Social media" links={campaign.social} />
        <LinkSection title="Petitions" links={campaign.petitions} />
        <LinkSection title="Volunteer" links={campaign.volunteer} />
        <LinkSection title="Contact" links={campaign.contact} />
        <LinkSection title="News & resources" links={[...(campaign.news ?? []), ...(campaign.resources ?? [])]} />
        <LinkSection title="Merchandise" links={campaign.merch} />
      </div>

      {related.length > 0 && (
        <section className="mt-14 pt-10 border-t border-[#1a4d3a]/10">
          <h2 className="text-xl sm:text-2xl font-light text-[#142818] mb-6">Related campaigns</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={indigenousHubPath('campaigns', r.slug)}
                  className="block rounded-xl border border-[#1a4d3a]/10 bg-white p-4 hover:border-[#1a4d3a]/25 transition-colors"
                >
                  <p className="font-light text-[#142818]">{r.title}</p>
                  <p className="text-sm text-[#5a7a66] mt-1 line-clamp-2">{r.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
