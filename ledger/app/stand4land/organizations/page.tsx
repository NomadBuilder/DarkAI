import Link from 'next/link'
import hubData from '../../../public/data/indigenous-hub.json'
import { HubPage, HubPageIntro } from '@/components/indigenous/HubPage'
import { indigenousHubPath, parseIndigenousHubFile, PROVINCE_LABELS, hubPageTitle } from '@/lib/indigenous-hub'
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

      <div className="grid gap-6 sm:grid-cols-2">
        {hub.organizations.map((org) => (
          <article
            key={org.slug}
            className="rounded-2xl border border-[#1a4d3a]/10 bg-white p-6 sm:p-8 shadow-sm hover:border-[#1a4d3a]/20 transition-colors"
          >
            <p className="text-xs uppercase tracking-wider text-[#3d7a57]">{org.type}</p>
            <h2 className="text-xl sm:text-2xl font-light text-[#142818] mt-1">{org.name}</h2>
            <p className="mt-1 text-sm text-[#5a7a66]">
              {org.regions.map((r) => PROVINCE_LABELS[r]).join(' · ')}
            </p>
            <p className="mt-4 text-[#3d5c48] font-light leading-relaxed">{org.mission}</p>
            {org.initiatives && org.initiatives.length > 0 && (
              <ul className="mt-4 space-y-1.5">
                {org.initiatives.map((item) => (
                  <li key={item} className="text-sm text-[#5a7a66] flex gap-2">
                    <span className="text-[#c4a574]">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t border-[#1a4d3a]/8">
              <a
                href={org.website.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[#1a4d3a] hover:underline"
              >
                Website ↗
              </a>
              {org.donate?.map((d) => (
                <a
                  key={d.href}
                  href={d.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#5a7a66] hover:underline"
                >
                  {d.label} ↗
                </a>
              ))}
            </div>
            {org.relatedCampaignSlugs && org.relatedCampaignSlugs.length > 0 && (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-wider text-[#5a7a66] mb-2">Related campaigns</p>
                <div className="flex flex-wrap gap-2">
                  {org.relatedCampaignSlugs.map((slug) => (
                    <Link
                      key={slug}
                      href={indigenousHubPath('campaigns', slug)}
                      className="text-xs text-[#1a4d3a] bg-[#1a4d3a]/8 px-2 py-1 rounded-full hover:bg-[#1a4d3a]/15"
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
