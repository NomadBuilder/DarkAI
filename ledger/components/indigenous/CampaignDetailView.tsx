'use client'

import Link from 'next/link'
import type { HubLink as HubLinkType, IndigenousCampaign, IndigenousHubFile } from '@/lib/indigenous-hub'
import {
  CAMPAIGN_ISSUE_LABELS,
  CAMPAIGN_STATUS_LABELS,
  PROVINCE_LABELS,
  getCampaignBySlug,
  indigenousHubPath,
} from '@/lib/indigenous-hub'
import HubCampaignMedia from '@/components/indigenous/HubCampaignMedia'
import { getCampaignLandImage } from '@/lib/hub-land-images'

function LinkSection({ title, links }: { title: string; links?: HubLinkType[] }) {
  if (!links?.length) return null
  return (
    <section className="hub-land-card rounded-xl border p-6 sm:p-8">
      <h2 className="hub-display text-lg sm:text-xl font-semibold text-[var(--hub-land-ink)] mb-4">{title}</h2>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <a
              href={link.href}
              target={link.href.startsWith('mailto:') ? undefined : '_blank'}
              rel={link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
              className="text-[var(--hub-land-forest)] font-medium hover:underline underline-offset-2"
            >
              {link.label} {link.href.startsWith('mailto:') ? '' : '↗'}
            </a>
            {link.note && <p className="text-sm mt-0.5 text-[var(--hub-land-muted)]">{link.note}</p>}
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
  const image = getCampaignLandImage(campaign.slug)
  const related = (campaign.relatedSlugs ?? [])
    .map((slug) => getCampaignBySlug(hub, slug))
    .filter(Boolean) as IndigenousCampaign[]

  const sectionTitle = 'hub-display text-xl sm:text-2xl font-semibold text-[var(--hub-land-ink)] mb-4'
  const bodyText = 'text-[var(--hub-land-muted)] leading-relaxed text-lg'

  return (
    <article>
      <header className="relative -mx-4 sm:-mx-6 lg:-mx-8 mb-10 md:mb-14 overflow-hidden rounded-b-xl">
        <HubCampaignMedia
          campaign={campaign}
          variant="detail"
          overlay={
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c2419]/90 via-[#1c2419]/50 to-[#1c2419]/30" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 md:p-12 z-10">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs uppercase tracking-wider text-white bg-white/15 backdrop-blur-sm px-3 py-1 rounded">
                    {CAMPAIGN_STATUS_LABELS[campaign.status]}
                  </span>
                  {campaign.provinces.map((p) => (
                    <span key={p} className="text-xs text-white/90 bg-white/10 backdrop-blur-sm px-3 py-1 rounded">
                      {PROVINCE_LABELS[p]}
                    </span>
                  ))}
                </div>
                <h1 className="hub-display text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight max-w-4xl">
                  {campaign.title}
                </h1>
                <p className="mt-3 text-lg text-[#e8f0e4]/90">{campaign.nations.join(' · ')}</p>
                {image?.credit && <p className="mt-4 text-xs text-white/50">{image.credit}</p>}
              </div>
            </>
          }
        />
        <div className="px-4 sm:px-0 mt-8 max-w-3xl">
          <p className={`${bodyText} text-xl`}>{campaign.summary}</p>
          {campaign.officialSite && (
            <a
              href={campaign.officialSite.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex mt-6 items-center gap-2 rounded-lg bg-[var(--hub-land-forest)] px-5 py-3 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Official campaign site ↗
            </a>
          )}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className={sectionTitle}>Why it matters</h2>
            <p className={`${bodyText} hub-land-quote pl-5 text-xl`}>{campaign.whyItMatters}</p>
          </section>

          <section>
            <h2 className={sectionTitle}>Background</h2>
            <p className={bodyText}>{campaign.background}</p>
            {campaign.perspectives && (
              <p className="mt-4 hub-land-quote text-[var(--hub-land-muted)] text-xl leading-relaxed pl-5">
                {campaign.perspectives}
              </p>
            )}
            {campaign.statusDetail && (
              <p className="mt-4 text-sm italic text-[var(--hub-land-muted)]">{campaign.statusDetail}</p>
            )}
          </section>

          {campaign.timeline.length > 0 && (
            <section>
              <h2 className={sectionTitle}>Timeline</h2>
              <ol className="space-y-6 border-l-2 border-[var(--hub-land-cedar)]/40 pl-6">
                {campaign.timeline.map((ev) => (
                  <li key={`${ev.date}-${ev.title}`} className="relative">
                    <span className="absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--hub-land-cedar)] ring-4 ring-[var(--hub-land-bg)]" />
                    <p className="text-sm font-medium text-[var(--hub-land-forest)]">{ev.date}</p>
                    <p className="text-base mt-0.5 text-[var(--hub-land-ink)]">{ev.title}</p>
                    {ev.summary && <p className="text-sm mt-1 text-[var(--hub-land-muted)]">{ev.summary}</p>}
                    {ev.sourceUrl && (
                      <a
                        href={ev.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--hub-land-river)] hover:underline mt-1 inline-block"
                      >
                        Source: {ev.sourceLabel ?? 'Link'} ↗
                      </a>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="rounded-xl bg-[var(--hub-land-forest)] text-[#e8f0e4] p-6 sm:p-8">
            <h2 className="hub-display text-xl sm:text-2xl font-semibold mb-3">How you can help</h2>
            <p className="text-sm opacity-90 mb-5">
              Support flows directly to official campaign channels — we do not collect donations here.
            </p>
            <div className="flex flex-wrap gap-3">
              {campaign.donate?.[0] && (
                <a
                  href={campaign.donate[0].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-[#e8dfd0] text-[#1c2419] px-4 py-2.5 text-sm font-medium hover:bg-white transition-colors"
                >
                  Donate (official) ↗
                </a>
              )}
              {campaign.petitions?.[0] && (
                <a
                  href={campaign.petitions[0].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/30 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors"
                >
                  Petition ↗
                </a>
              )}
              {campaign.volunteer?.[0] && (
                <a
                  href={campaign.volunteer[0].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/30 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors"
                >
                  Volunteer ↗
                </a>
              )}
              <Link
                href={indigenousHubPath('support')}
                className="rounded-lg border border-white/30 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors"
              >
                More ways to help
              </Link>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="hub-land-card rounded-xl border p-5 sm:p-6 sticky top-24">
            <h2 className="text-sm uppercase tracking-wider text-[var(--hub-land-muted)] mb-3">Issues</h2>
            <div className="flex flex-wrap gap-2">
              {campaign.issues.map((issue) => (
                <span
                  key={issue}
                  className="text-xs text-[var(--hub-land-river)] border-b border-[var(--hub-land-river)]/30 pb-0.5"
                >
                  {CAMPAIGN_ISSUE_LABELS[issue]}
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs text-[var(--hub-land-muted)]">Verified {campaign.lastVerified}</p>
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
        <section className="mt-14 pt-10 border-t border-[var(--hub-land-forest)]/15">
          <h2 className={sectionTitle}>Related campaigns</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={indigenousHubPath('campaigns', r.slug)}
                  className="block hub-land-card rounded-xl border p-4 hover:shadow-md transition-all"
                >
                  <p className="font-semibold text-[var(--hub-land-ink)]">{r.title}</p>
                  <p className="text-sm mt-1 line-clamp-2 text-[var(--hub-land-muted)]">{r.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
