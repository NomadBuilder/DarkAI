import Link from 'next/link'
import hubData from '../../../public/data/indigenous-hub.json'
import { HubPage, HubPageIntro } from '@/components/indigenous/HubPage'
import {
  HUB_ORG_SUBMIT_PATH,
  indigenousHubPath,
  parseIndigenousHubFile,
  PROVINCE_LABELS,
  hubPageTitle,
} from '@/lib/indigenous-hub'
import { buildHubPageMetadata } from '@/lib/page-metadata'

export const metadata = buildHubPageMetadata(
  hubPageTitle('Organizations'),
  'Indigenous-led organizations working on land stewardship, treaty rights, legal advocacy, and environmental protection.'
)

export default function IndigenousOrganizationsPage() {
  const hub = parseIndigenousHubFile(hubData)

  return (
    <HubPage>
      <HubPageIntro title="Organizations">
        Indigenous-led and Indigenous-focused organizations supporting land defence, IPCAs, legal advocacy, and
        climate justice. Donations go directly to each organization.
      </HubPageIntro>

      <div className="mb-10 hub-land-card rounded-xl border p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="hub-display text-lg font-semibold text-[var(--hub-land-ink)]">Missing an organization?</h2>
          <p className="mt-1 text-sm text-[var(--hub-land-muted)]">
            Suggest one for review — we verify every listing before it goes live.
          </p>
        </div>
        <Link
          href={HUB_ORG_SUBMIT_PATH}
          className="shrink-0 inline-flex items-center justify-center rounded-lg bg-[var(--hub-land-forest)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Suggest an organization →
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {hub.organizations.map((org) => (
          <article key={org.slug} className="hub-land-card rounded-xl border p-6 sm:p-8 hover:shadow-md transition-shadow">
            <p className="text-xs uppercase tracking-wider text-[var(--hub-land-river)]">{org.type}</p>
            <h2 className="hub-display text-xl sm:text-2xl font-semibold text-[var(--hub-land-ink)] mt-1">{org.name}</h2>
            <p className="mt-1 text-sm text-[var(--hub-land-muted)]">
              {org.regions.map((r) => PROVINCE_LABELS[r]).join(' · ')}
            </p>
            <p className="mt-4 text-[var(--hub-land-muted)] leading-relaxed">{org.mission}</p>
            {org.initiatives && org.initiatives.length > 0 && (
              <ul className="mt-4 space-y-1.5">
                {org.initiatives.map((item) => (
                  <li key={item} className="text-sm text-[var(--hub-land-muted)] flex gap-2">
                    <span className="text-[var(--hub-land-cedar)]">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t border-[var(--hub-land-forest)]/10">
              <a
                href={org.website.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[var(--hub-land-forest)] hover:underline"
              >
                Website ↗
              </a>
              {org.donate?.map((d) => (
                <a
                  key={d.href}
                  href={d.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--hub-land-muted)] hover:underline"
                >
                  {d.label} ↗
                </a>
              ))}
            </div>
            {org.relatedCampaignSlugs && org.relatedCampaignSlugs.length > 0 && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wider text-[var(--hub-land-muted)] mb-2">Related campaigns</p>
                <div className="flex flex-wrap gap-2">
                  {org.relatedCampaignSlugs.map((slug) => (
                    <Link
                      key={slug}
                      href={indigenousHubPath('campaigns', slug)}
                      className="text-xs text-[var(--hub-land-forest)] border border-[var(--hub-land-forest)]/20 px-2 py-1 rounded hover:bg-[var(--hub-land-forest)]/8"
                    >
                      {slug.replace(/-/g, ' ')}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </HubPage>
  )
}
