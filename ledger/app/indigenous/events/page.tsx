import Link from 'next/link'
import hubData from '../../../public/data/indigenous-hub.json'
import { getCampaignBySlug, indigenousHubPath, parseIndigenousHubFile } from '@/lib/indigenous-hub'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata = buildPageMetadata(
  'Events — Indigenous Land & Water Hub',
  'Public rallies, community events, court dates, and volunteer opportunities linked to Indigenous-led campaigns.'
)

const EVENT_TYPE_LABELS = {
  rally: 'Rally',
  webinar: 'Webinar',
  fundraiser: 'Fundraiser',
  court: 'Court date',
  community: 'Community event',
  volunteer: 'Volunteer',
} as const

export default function IndigenousEventsPage() {
  const hub = parseIndigenousHubFile(hubData)
  const sorted = [...hub.events].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-12 md:py-16 max-w-4xl mx-auto">
      <header className="mb-10 md:mb-14">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#142818]">Events</h1>
        <p className="mt-4 text-lg text-[#3d5c48] font-light leading-relaxed">
          Public events and deadlines tied to campaigns in this directory. Always confirm details on the official source
          before you travel or register.
        </p>
      </header>

      {sorted.length === 0 ? (
        <p className="text-[#5a7a66] font-light">No events listed yet. Check campaign official sites for the latest.</p>
      ) : (
        <ul className="space-y-4">
          {sorted.map((ev) => {
            const campaign = ev.campaignSlug ? getCampaignBySlug(hub, ev.campaignSlug) : undefined
            return (
              <li
                key={ev.id}
                className="rounded-2xl border border-[#1a4d3a]/10 bg-white p-6 sm:p-8"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs uppercase tracking-wider text-[#1a4d3a] bg-[#1a4d3a]/8 px-2 py-0.5 rounded-full">
                    {EVENT_TYPE_LABELS[ev.type]}
                  </span>
                  <time dateTime={ev.date} className="text-sm text-[#5a7a66]">
                    {ev.date}
                    {ev.endDate && ev.endDate !== ev.date ? ` – ${ev.endDate}` : ''}
                  </time>
                </div>
                <h2 className="text-lg sm:text-xl font-light text-[#142818]">{ev.title}</h2>
                {ev.location && <p className="text-sm text-[#5a7a66] mt-1">{ev.location}</p>}
                {ev.note && <p className="text-sm text-[#3d5c48] font-light mt-2">{ev.note}</p>}
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  {ev.href && (
                    <a
                      href={ev.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1a4d3a] font-medium hover:underline"
                    >
                      Official details ↗
                    </a>
                  )}
                  {campaign && (
                    <Link href={indigenousHubPath('campaigns', campaign.slug)} className="text-[#5a7a66] hover:underline">
                      {campaign.title}
                    </Link>
                  )}
                  {ev.sourceLabel && !ev.href && (
                    <span className="text-[#5a7a66]">Source: {ev.sourceLabel}</span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
