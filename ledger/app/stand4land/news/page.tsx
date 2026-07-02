import hubData from '../../../public/data/indigenous-hub.json'
import { HubPage, HubPageIntro } from '@/components/indigenous/HubPage'
import { parseIndigenousHubFile, hubPageTitle } from '@/lib/indigenous-hub'
import { buildHubPageMetadata } from '@/lib/page-metadata'

export const metadata = buildHubPageMetadata(
  hubPageTitle('News sources'),
  'Trusted Nation-led and independent news sources for land defence, treaty rights, and environmental justice.'
)

const TYPE_LABELS = {
  'indigenous-led': 'Nation-led media',
  journalism: 'Independent journalism',
  research: 'Research & policy',
} as const

export default function IndigenousNewsPage() {
  const hub = parseIndigenousHubFile(hubData)

  return (
    <HubPage>
      <HubPageIntro title="News & updates">
        We do not republish news stories here — that would strip context and attribution. Instead, follow these
        Nation-led and trusted independent sources directly. Always check the original publisher.
      </HubPageIntro>

      <div className="space-y-4">
        {hub.newsSources.map((source) => (
          <article
            key={source.href}
            className="rounded-2xl border border-[#1a4d3a]/10 bg-white p-6 hover:border-[#1a4d3a]/20 transition-colors"
          >
            <p className="text-xs uppercase tracking-wider text-[#3d7a57]">{TYPE_LABELS[source.type]}</p>
            <h2 className="text-xl font-light text-[#142818] mt-1">
              <a href={source.href} target="_blank" rel="noopener noreferrer" className="hover:text-[#1a4d3a]">
                {source.name} ↗
              </a>
            </h2>
            <p className="mt-2 text-[#3d5c48] font-light">{source.description}</p>
          </article>
        ))}
      </div>

      <p className="mt-10 text-sm text-[#5a7a66] font-light italic border-l-4 border-[#c4a574] pl-4">
        Campaign pages may link to specific reporting. For frontline updates, follow each campaign&apos;s official social
        media and website first.
      </p>
    </HubPage>
  )
}
