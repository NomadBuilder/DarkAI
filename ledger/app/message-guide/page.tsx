'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import TopNavigation from '../../components/TopNavigation'
import ResourceNextSteps from '../../components/ResourceNextSteps'

type IssueKey =
  | 'healthcare'
  | 'water'
  | 'public-land'
  | 'wildlife'
  | 'indigenous-rights'
  | 'transparency'
  | 'education'

type MessageItem = {
  id: string
  issue: IssueKey
  audience: 'interview' | 'social' | 'neighbors'
  sayThis: string
  avoidThis: string
  why: string
}

const ISSUE_PAGES: Record<
  IssueKey,
  { label: string; href: string; flyerHref?: string }
> = {
  healthcare: { label: 'Healthcare', href: '/healthcare', flyerHref: '/flyers/healthcare' },
  water: { label: 'Water', href: '/water', flyerHref: '/flyers/water' },
  'public-land': { label: 'Public land', href: '/public-land', flyerHref: '/flyers/public-land' },
  wildlife: { label: 'Wildlife', href: '/wildlife', flyerHref: '/flyers/wildlife' },
  'indigenous-rights': {
    label: 'Indigenous rights',
    href: '/indigenous-rights',
    flyerHref: '/flyers/indigenous-rights',
  },
  transparency: { label: 'The Receipts', href: '/receipts', flyerHref: '/flyers/freedom-of-information' },
  education: { label: 'Social post ideas', href: '/social-ideas' },
}

const ISSUE_LABELS: Record<IssueKey, string> = {
  healthcare: 'Healthcare',
  water: 'Water',
  'public-land': 'Public land',
  wildlife: 'Wildlife',
  'indigenous-rights': 'Indigenous rights',
  transparency: 'Transparency & FOI',
  education: 'Education',
}

const MESSAGE_LIBRARY: MessageItem[] = [
  {
    id: 'health-1',
    issue: 'healthcare',
    audience: 'interview',
    sayThis: 'We are asking for public dollars to stay in public care, where accountability and access are strongest.',
    avoidThis: 'The system is totally broken and nothing works.',
    why: 'Specific asks and constructive framing are more persuasive than broad collapse language.',
  },
  {
    id: 'health-2',
    issue: 'healthcare',
    audience: 'social',
    sayThis: 'People are waiting longer while private costs rise — we need stronger public capacity now.',
    avoidThis: 'They are stealing all our healthcare.',
    why: 'Data-grounded language is harder to dismiss and easier to share.',
  },
  {
    id: 'water-1',
    issue: 'water',
    audience: 'neighbors',
    sayThis: 'Clean water and wastewater are public responsibilities — communities should control what they depend on every day.',
    avoidThis: 'They are poisoning the water on purpose.',
    why: 'Shared-values language keeps the conversation local and credible.',
  },
  {
    id: 'water-2',
    issue: 'water',
    audience: 'interview',
    sayThis: 'When water systems move behind corporate walls, ratepayers lose transparency and local accountability.',
    avoidThis: 'All privatization is evil.',
    why: 'Focus on governance and documented policy changes, not moral absolutes.',
  },
  {
    id: 'land-1',
    issue: 'public-land',
    audience: 'neighbors',
    sayThis: 'Parks, farmland, and waterfront belong to all of us — not a giveaway behind closed doors.',
    avoidThis: 'They want to destroy nature.',
    why: 'Protecting shared land is a mainstream value that broadens support.',
  },
  {
    id: 'land-2',
    issue: 'public-land',
    audience: 'social',
    sayThis: 'They promised to protect the Greenbelt — then opened it up. Once farmland is paved, we do not get it back.',
    avoidThis: 'All development is bad.',
    why: 'Name the broken promise and the irreversible cost — avoid false economy-vs-environment framing.',
  },
  {
    id: 'wild-1',
    issue: 'wildlife',
    audience: 'interview',
    sayThis: 'Weakening species protections shifts risk onto communities and future generations — safeguards are not red tape.',
    avoidThis: 'They hate animals.',
    why: 'Policy impact beats motive-reading; cite documented rollbacks.',
  },
  {
    id: 'indig-1',
    issue: 'indigenous-rights',
    audience: 'neighbors',
    sayThis: 'Free, prior, and informed consent is not optional — major projects should not move ahead over community objections.',
    avoidThis: 'This is all colonial genocide.',
    why: 'Rights-based framing is precise and harder to dismiss than broad accusation.',
  },
  {
    id: 'trans-1',
    issue: 'transparency',
    audience: 'interview',
    sayThis: 'We are calling for transparent decisions, public records, and independent oversight.',
    avoidThis: 'Everyone is corrupt.',
    why: 'Concrete accountability demands are credible and actionable.',
  },
  {
    id: 'trans-2',
    issue: 'transparency',
    audience: 'social',
    sayThis: 'When freedom-of-information access is rolled back, the public pays the price in closed-door deals.',
    avoidThis: 'This is all a giant conspiracy.',
    why: 'Institutional critique works better than speculative claims.',
  },
  {
    id: 'edu-1',
    issue: 'education',
    audience: 'neighbors',
    sayThis: 'Classrooms need stable funding so students get support before problems escalate.',
    avoidThis: 'Schools are a disaster zone.',
    why: 'Community-first language invites agreement and conversation.',
  },
  {
    id: 'edu-2',
    issue: 'education',
    audience: 'social',
    sayThis: 'Public education works best when teachers and students are resourced, not stretched thin.',
    avoidThis: 'Nobody in government cares about kids.',
    why: 'Avoid mind-reading motives; focus on policy impact.',
  },
]

export default function MessageGuidePage() {
  const [issue, setIssue] = useState<'all' | IssueKey>('all')
  const [audience, setAudience] = useState<'all' | MessageItem['audience']>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return MESSAGE_LIBRARY.filter((item) => {
      if (issue !== 'all' && item.issue !== issue) return false
      if (audience !== 'all' && item.audience !== audience) return false
      if (!q) return true
      return [item.sayThis, item.avoidThis, item.why].join(' ').toLowerCase().includes(q)
    })
  }, [issue, audience, query])

  const copyLine = async (line: string) => {
    try {
      await navigator.clipboard.writeText(line)
    } catch {
      // no-op fallback
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNavigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
        <section className="mb-8">
          <h1 className="text-3xl md:text-4xl font-light text-slate-900">Message Guide</h1>
          <p className="mt-2 text-slate-600 font-light max-w-3xl">
            Short tested talking points by issue, with clear “say this / avoid this” phrasing. Each topic links to
            sourced facts on the site and matching printable flyers.
          </p>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm text-slate-600">
              Issue
              <select
                value={issue}
                onChange={(e) => setIssue(e.target.value as typeof issue)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="all">All issues</option>
                {(Object.keys(ISSUE_LABELS) as IssueKey[]).map((key) => (
                  <option key={key} value={key}>
                    {ISSUE_LABELS[key]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-slate-600">
              Context
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as typeof audience)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="all">All contexts</option>
                <option value="interview">Interview</option>
                <option value="social">Social post</option>
                <option value="neighbors">Neighbors/community</option>
              </select>
            </label>
            <label className="text-sm text-slate-600">
              Search
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search wording..."
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {filtered.map((item) => {
            const page = ISSUE_PAGES[item.issue]
            return (
              <article key={item.id} className="rounded-2xl bg-white border border-slate-200 p-5">
                <div className="flex flex-wrap gap-2 mb-3 text-xs">
                  <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700">{ISSUE_LABELS[item.issue]}</span>
                  <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600">{item.audience}</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-green-700 mb-1">Say this</p>
                    <p className="text-sm text-slate-900 leading-relaxed">{item.sayThis}</p>
                    <button
                      type="button"
                      onClick={() => copyLine(item.sayThis)}
                      className="mt-2 text-xs text-blue-700 hover:underline"
                    >
                      Copy line
                    </button>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-red-700 mb-1">Avoid this</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{item.avoidThis}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Why</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.why}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
                    <Link href={page.href} className="text-xs font-medium text-[#2E4A6B] hover:underline">
                      Read more on {page.label} →
                    </Link>
                    {page.flyerHref ? (
                      <Link href={page.flyerHref} className="text-xs font-medium text-[#2E4A6B] hover:underline">
                        Printable flyer →
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })}
        </section>

        <ResourceNextSteps />
      </main>
    </div>
  )
}
