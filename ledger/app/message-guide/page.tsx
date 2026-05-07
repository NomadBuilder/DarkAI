'use client'

import { useMemo, useState } from 'react'
import TopNavigation from '../../components/TopNavigation'

type MessageItem = {
  id: string
  issue: 'healthcare' | 'education' | 'corruption' | 'environment'
  audience: 'interview' | 'social' | 'neighbors'
  sayThis: string
  avoidThis: string
  why: string
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
    sayThis: 'People are waiting longer while private costs rise - we need stronger public capacity now.',
    avoidThis: 'They are stealing all our healthcare.',
    why: 'Data-grounded language is harder to dismiss and easier to share.',
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
  {
    id: 'corr-1',
    issue: 'corruption',
    audience: 'interview',
    sayThis: 'We are calling for transparent decisions, public records, and independent oversight.',
    avoidThis: 'Everyone is corrupt.',
    why: 'Concrete accountability demands are credible and actionable.',
  },
  {
    id: 'corr-2',
    issue: 'corruption',
    audience: 'social',
    sayThis: 'When decisions happen behind closed doors, the public pays the price.',
    avoidThis: 'This is all a giant conspiracy.',
    why: 'Institutional critique works better than speculative claims.',
  },
  {
    id: 'env-1',
    issue: 'environment',
    audience: 'neighbors',
    sayThis: 'Clean water, protected land, and healthy communities are basic public responsibilities.',
    avoidThis: 'They want to destroy nature.',
    why: 'Shared values language broadens support beyond activist circles.',
  },
  {
    id: 'env-2',
    issue: 'environment',
    audience: 'interview',
    sayThis: 'Environmental safeguards are not red tape - they protect communities and long-term costs.',
    avoidThis: 'All development is bad.',
    why: 'Balanced framing helps avoid false economy-vs-environment narratives.',
  },
]

export default function MessageGuidePage() {
  const [issue, setIssue] = useState<'all' | MessageItem['issue']>('all')
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
            Short tested talking points by issue, with clear “say this / avoid this” phrasing for interviews, social posts, and local conversations.
          </p>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm text-slate-600">
              Issue
              <select value={issue} onChange={(e) => setIssue(e.target.value as typeof issue)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
                <option value="all">All issues</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="corruption">Corruption</option>
                <option value="environment">Environment</option>
              </select>
            </label>
            <label className="text-sm text-slate-600">
              Context
              <select value={audience} onChange={(e) => setAudience(e.target.value as typeof audience)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2">
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
          {filtered.map((item) => (
            <article key={item.id} className="rounded-2xl bg-white border border-slate-200 p-5">
              <div className="flex flex-wrap gap-2 mb-3 text-xs">
                <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700">{item.issue}</span>
                <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600">{item.audience}</span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-green-700 mb-1">Say this</p>
                  <p className="text-sm text-slate-900 leading-relaxed">{item.sayThis}</p>
                  <button type="button" onClick={() => copyLine(item.sayThis)} className="mt-2 text-xs text-blue-700 hover:underline">
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
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
