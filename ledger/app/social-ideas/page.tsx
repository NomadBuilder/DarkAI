'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import TopNavigation from '../../components/TopNavigation'
import { FF_COLORS, FF_PAGE_GRADIENT } from '../../lib/ff-get-involved'
import {
  FIGHT_FORD_HASHTAG,
  FORMAT_LABELS,
  ISSUE_LABELS,
  PLATFORM_LABELS,
  SOCIAL_POST_IDEAS,
  buildShareableCaption,
  type FordIssue,
  type PostFormat,
  type SocialPlatform,
} from '../../lib/social-post-ideas'

type PlatformFilter = 'all' | SocialPlatform
type IssueFilter = 'all' | FordIssue
type FormatFilter = 'all' | PostFormat

export default function SocialIdeasPage() {
  const [platform, setPlatform] = useState<PlatformFilter>('all')
  const [issue, setIssue] = useState<IssueFilter>('all')
  const [format, setFormat] = useState<FormatFilter>('all')
  const [query, setQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return SOCIAL_POST_IDEAS.filter((idea) => {
      if (issue !== 'all' && idea.issue !== issue) return false
      if (format !== 'all' && idea.format !== format) return false
      if (platform !== 'all' && !idea.platforms.includes(platform)) return false
      if (!q) return true
      const hay = [
        idea.title,
        idea.caption,
        idea.visualBrief,
        idea.designTips,
        idea.headline ?? '',
        ISSUE_LABELS[idea.issue],
        FORMAT_LABELS[idea.format],
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [platform, issue, format, query])

  const copyCaption = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      window.setTimeout(() => setCopiedId(null), 2000)
    } catch {
      /* ignore */
    }
  }

  const selectClass =
    'mt-1 w-full rounded-xl border border-white/20 bg-white/10 text-[#f9e04c] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9a3c]/50'
  const inputClass =
    'mt-1 w-full rounded-xl border border-white/20 bg-white/10 text-[#f9e04c] placeholder:text-[#f9e04c]/40 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9a3c]/50'

  return (
    <div className="min-h-screen" style={{ background: FF_PAGE_GRADIENT }}>
      <TopNavigation />
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-28 sm:pt-32 pb-16">
        <header className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-[#f9e04c]/80 mb-3 font-medium">Share the movement</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#f9e04c] tracking-tight">
            Social post ideas
          </h1>
          <p className="mt-4 text-[#f9e04c]/90 font-light max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Quick, clear graphics, memes, and GIF concepts—each tied to a different Ford issue. Copy captions for
            Facebook, Instagram, Threads, and more. Always include{' '}
            <span className="font-semibold text-[#ff9a3c]">{FIGHT_FORD_HASHTAG}</span>.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/join"
              className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
              style={{ backgroundColor: FF_COLORS.headingBg, color: FF_COLORS.headingText }}
            >
              Get a yard sign →
            </Link>
            <Link
              href="/message-guide"
              className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-medium border border-[#f9e04c]/40 text-[#f9e04c] hover:bg-white/10 transition-colors"
            >
              Message guide
            </Link>
          </div>
        </header>

        <section className="rounded-2xl border border-[#f9e04c]/25 bg-black/20 backdrop-blur-sm p-5 sm:p-6 mb-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm text-[#f9e04c]/80 font-light">
              Platform
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as PlatformFilter)}
                className={selectClass}
              >
                <option value="all">All platforms</option>
                {(Object.keys(PLATFORM_LABELS) as SocialPlatform[]).map((p) => (
                  <option key={p} value={p}>
                    {PLATFORM_LABELS[p]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-[#f9e04c]/80 font-light">
              Ford issue
              <select value={issue} onChange={(e) => setIssue(e.target.value as IssueFilter)} className={selectClass}>
                <option value="all">All issues</option>
                {(Object.keys(ISSUE_LABELS) as FordIssue[]).map((i) => (
                  <option key={i} value={i}>
                    {ISSUE_LABELS[i]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-[#f9e04c]/80 font-light">
              Format
              <select value={format} onChange={(e) => setFormat(e.target.value as FormatFilter)} className={selectClass}>
                <option value="all">All formats</option>
                {(Object.keys(FORMAT_LABELS) as PostFormat[]).map((f) => (
                  <option key={f} value={f}>
                    {FORMAT_LABELS[f]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-[#f9e04c]/80 font-light sm:col-span-2 lg:col-span-1">
              Search
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="meme, carousel, water…"
                className={inputClass}
              />
            </label>
          </div>
          <p className="mt-4 text-xs text-[#f9e04c]/60 font-light">
            Showing {filtered.length} of {SOCIAL_POST_IDEAS.length} ideas
          </p>
        </section>

        {filtered.length === 0 ? (
          <p className="text-center text-[#f9e04c]/70 font-light py-12">No ideas match—try clearing a filter.</p>
        ) : (
          <section className="grid gap-6 md:grid-cols-2">
            {filtered.map((idea) => {
              const caption = buildShareableCaption(idea)
              return (
                <article
                  key={idea.id}
                  className="rounded-2xl border border-[#f9e04c]/20 bg-gradient-to-br from-white/[0.12] via-white/[0.06] to-transparent p-5 sm:p-6 shadow-lg flex flex-col"
                >
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#f9e04c]/20 text-[#f9e04c]">
                      {ISSUE_LABELS[idea.issue]}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#ff9a3c]/25 text-[#ffb366]">
                      {FORMAT_LABELS[idea.format]}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-[#f9e04c] mb-1">{idea.title}</h2>
                  <p className="text-xs text-[#f9e04c]/65 mb-4">
                    Best on:{' '}
                    {idea.platforms.map((p) => PLATFORM_LABELS[p]).join(' · ')}
                  </p>

                  {idea.headline && (
                    <div
                      className="mb-4 rounded-xl px-4 py-3 text-center text-sm font-bold uppercase tracking-wide"
                      style={{ backgroundColor: FF_COLORS.headingBg, color: FF_COLORS.headingText }}
                    >
                      {idea.headline}
                    </div>
                  )}

                  <div className="space-y-4 flex-1 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#ff9a3c] mb-1.5">Visual / meme idea</p>
                      <p className="text-[#f9e04c]/90 font-light leading-relaxed">{idea.visualBrief}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#f9e04c]/50 mb-1.5">Design tips</p>
                      <p className="text-[#f9e04c]/75 font-light leading-relaxed">{idea.designTips}</p>
                    </div>
                    <div className="rounded-xl bg-black/25 border border-white/10 p-3">
                      <p className="text-xs uppercase tracking-wider text-[#f9e04c]/50 mb-2">Caption (copy & paste)</p>
                      <p className="text-[#f9e04c] font-light leading-relaxed whitespace-pre-wrap text-sm">{caption}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => void copyCaption(idea.id, caption)}
                    className="mt-5 w-full py-3 rounded-xl text-sm font-semibold transition-colors"
                    style={{
                      backgroundColor: copiedId === idea.id ? '#2f2260' : FF_COLORS.background,
                      color: FF_COLORS.text,
                      border: `1px solid ${FF_COLORS.link}`,
                    }}
                  >
                    {copiedId === idea.id ? 'Copied!' : 'Copy caption'}
                  </button>
                </article>
              )
            })}
          </section>
        )}

        <section className="mt-12 rounded-2xl border border-[#f9e04c]/30 bg-[#f9e04c]/10 p-6 sm:p-8 text-center">
          <h2 className="text-xl font-semibold text-[#f9e04c] mb-2">Make it in Canva or on your phone</h2>
          <p className="text-sm text-[#f9e04c]/85 font-light max-w-xl mx-auto leading-relaxed">
            Purple <span className="font-mono text-xs">#3d2b7a</span>, yellow{' '}
            <span className="font-mono text-xs">#f9e04c</span>, orange <span className="font-mono text-xs">#ff9a3c</span>
            . One issue per post keeps messages shareable. Tag {FIGHT_FORD_HASHTAG} every time.
          </p>
        </section>
      </main>
    </div>
  )
}
