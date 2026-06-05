'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import TopNavigation from '../../components/TopNavigation'
import { FF_COLORS, FF_PAGE_GRADIENT } from '../../lib/ff-get-involved'
import { generateSocialPostIdea } from '../../lib/social-post-ideas-generate'
import {
  FIGHT_FORD_HASHTAG,
  FORMAT_LABELS,
  ISSUE_LABELS,
  PLATFORM_LABELS,
  buildShareableCaption,
  type FordIssue,
  type PostFormat,
  type SocialPlatform,
  type SocialPostIdea,
} from '../../lib/social-post-ideas'
import {
  defaultSocialPostIdeasFile,
  loadSocialPostIdeasFile,
  serializeSocialPostIdeasFile,
  type SocialPostIdeasFile,
} from '../../lib/social-post-ideas-store'

type PlatformFilter = 'all' | SocialPlatform
type IssueFilter = 'all' | FordIssue
type FormatFilter = 'all' | PostFormat

const fieldClass =
  'w-full px-3 py-2 rounded-lg border border-white/20 bg-black/30 text-[#f9e04c] text-sm font-light focus:outline-none focus:ring-2 focus:ring-[#ff9a3c]/50'
const labelClass = 'block text-xs uppercase tracking-wider text-[#f9e04c]/60 mb-1'

function IdeaPreview({ idea }: { idea: SocialPostIdea }) {
  const displayHeadline = idea.headline?.trim() || idea.title
  return (
    <div
      className="mb-4 rounded-xl overflow-hidden border border-[#f9e04c]/30 aspect-[4/5] max-h-64 relative flex flex-col"
      style={{ background: 'linear-gradient(160deg, #5c4899 0%, #3d2b7a 55%, #2a1f58 100%)' }}
    >
      {idea.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={idea.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
      ) : null}
      <div className="relative z-10 flex flex-1 flex-col justify-center p-4 text-center">
        <p
          className="text-sm sm:text-base font-bold uppercase tracking-wide leading-tight px-2"
          style={{ color: FF_COLORS.headingBg }}
        >
          {displayHeadline}
        </p>
        <p className="mt-2 text-[10px] text-[#f9e04c]/70">{ISSUE_LABELS[idea.issue]}</p>
      </div>
      <div
        className="relative z-10 py-1.5 text-center text-[10px] font-semibold"
        style={{ backgroundColor: FF_COLORS.headingBg, color: FF_COLORS.headingText }}
      >
        {FIGHT_FORD_HASHTAG}
      </div>
    </div>
  )
}

function IdeaSummary({ idea, className = '' }: { idea: SocialPostIdea; className?: string }) {
  const caption = buildShareableCaption(idea)
  return (
    <div className={`space-y-3 text-sm mb-4 ${className}`}>
      <div className="flex flex-wrap gap-2">
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#f9e04c]/20 text-[#f9e04c]">
          {ISSUE_LABELS[idea.issue]}
        </span>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#ff9a3c]/25 text-[#ffb366]">
          {FORMAT_LABELS[idea.format]}
        </span>
      </div>
      <h2 className="text-lg font-semibold text-[#f9e04c]">{idea.title}</h2>
      <p className="text-xs text-[#f9e04c]/65">
        Best on: {idea.platforms.map((p) => PLATFORM_LABELS[p] ?? p).join(' · ')}
      </p>
      <p className="text-[#f9e04c]/90 font-light leading-relaxed line-clamp-2">{idea.visualBrief}</p>
      <div className="rounded-xl bg-black/25 border border-white/10 p-3">
        <p className="text-xs text-[#f9e04c]/50 mb-1">Caption</p>
        <p className="text-[#f9e04c] font-light whitespace-pre-wrap text-sm line-clamp-3">{caption}</p>
      </div>
    </div>
  )
}

function CollapsibleDetails({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="mb-4 flex-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl border border-[#f9e04c]/25 bg-black/20 text-left hover:bg-black/30 transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-[#f9e04c]">{title}</span>
        <span className="text-[#f9e04c]/60 text-lg shrink-0" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && <div className="space-y-3 mt-3">{children}</div>}
    </div>
  )
}

function IdeaCard({
  idea,
  editing,
  onChange,
  onRemove,
  copiedId,
  onCopy,
}: {
  idea: SocialPostIdea
  editing: boolean
  onChange: (next: SocialPostIdea) => void
  onRemove: () => void
  copiedId: string | null
  onCopy: (id: string, text: string) => void
}) {
  const caption = buildShareableCaption(idea)
  const platformStr = idea.platforms.join(', ')

  return (
    <article className="rounded-2xl border border-[#f9e04c]/20 bg-gradient-to-br from-white/[0.12] via-white/[0.06] to-transparent p-5 sm:p-6 shadow-lg flex flex-col">
      <IdeaPreview idea={idea} />

      {editing ? (
        <>
          <IdeaSummary idea={idea} />
          <CollapsibleDetails title="Edit details">
          <div>
            <span className={labelClass}>Title</span>
            <input
              className={fieldClass}
              value={idea.title}
              onChange={(e) => onChange({ ...idea, title: e.target.value })}
            />
          </div>
          <div>
            <span className={labelClass}>On-image headline</span>
            <input
              className={fieldClass}
              value={idea.headline ?? ''}
              onChange={(e) => onChange({ ...idea, headline: e.target.value })}
              placeholder="Large text on the graphic"
            />
          </div>
          <div>
            <span className={labelClass}>Background image (URL or upload)</span>
            <input
              className={fieldClass}
              value={idea.imageUrl?.startsWith('data:') ? '' : idea.imageUrl ?? ''}
              onChange={(e) => onChange({ ...idea, imageUrl: e.target.value || undefined })}
              placeholder="https://… or upload below"
            />
            <input
              type="file"
              accept="image/*"
              className="mt-2 block w-full text-xs text-[#f9e04c]/70 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[#f9e04c]/20 file:text-[#f9e04c]"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (!f) return
                if (f.size > 900_000) {
                  window.alert('Image must be under 900 KB for publishing.')
                  return
                }
                const reader = new FileReader()
                reader.onload = () => {
                  if (typeof reader.result === 'string') {
                    onChange({ ...idea, imageUrl: reader.result })
                  }
                }
                reader.readAsDataURL(f)
              }}
            />
          </div>
          <div>
            <span className={labelClass}>Visual / meme description</span>
            <textarea
              rows={3}
              className={`${fieldClass} resize-y`}
              value={idea.visualBrief}
              onChange={(e) => onChange({ ...idea, visualBrief: e.target.value })}
            />
          </div>
          <div>
            <span className={labelClass}>Caption</span>
            <textarea
              rows={4}
              className={`${fieldClass} resize-y`}
              value={idea.caption}
              onChange={(e) => onChange({ ...idea, caption: e.target.value })}
            />
          </div>
          <div>
            <span className={labelClass}>Design tips</span>
            <textarea
              rows={2}
              className={`${fieldClass} resize-y`}
              value={idea.designTips}
              onChange={(e) => onChange({ ...idea, designTips: e.target.value })}
            />
          </div>
          <div>
            <span className={labelClass}>Platforms (comma-separated)</span>
            <input
              className={fieldClass}
              value={platformStr}
              onChange={(e) =>
                onChange({
                  ...idea,
                  platforms: e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean) as SocialPlatform[],
                })
              }
            />
          </div>
          </CollapsibleDetails>
        </>
      ) : (
        <IdeaSummary idea={idea} />
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onCopy(idea.id, caption)}
          className="flex-1 min-w-[8rem] py-2.5 rounded-xl text-sm font-semibold"
          style={{
            backgroundColor: copiedId === idea.id ? '#2f2260' : FF_COLORS.background,
            color: FF_COLORS.text,
            border: `1px solid ${FF_COLORS.link}`,
          }}
        >
          {copiedId === idea.id ? 'Copied!' : 'Copy caption'}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="py-2.5 px-4 rounded-xl text-sm text-red-300 border border-red-400/40 hover:bg-red-950/40"
        >
          Remove
        </button>
      </div>
    </article>
  )
}

export default function SocialIdeasPage() {
  const [file, setFile] = useState<SocialPostIdeasFile>(defaultSocialPostIdeasFile())
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [editMode, setEditMode] = useState(true)
  const [platform, setPlatform] = useState<PlatformFilter>('all')
  const [issue, setIssue] = useState<IssueFilter>('all')
  const [format, setFormat] = useState<FormatFilter>('all')
  const [query, setQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'published' | 'error'>('idle')
  const [publishMessage, setPublishMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    loadSocialPostIdeasFile()
      .then((data) => {
        if (!cancelled) {
          setFile(data)
          setLoadStatus('ok')
        }
      })
      .catch(() => {
        if (!cancelled) setLoadStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const updateIdea = useCallback((id: string, next: SocialPostIdea) => {
    setFile((f) => ({
      ...f,
      ideas: f.ideas.map((i) => (i.id === id ? next : i)),
    }))
  }, [])

  const removeIdea = useCallback((id: string) => {
    if (!window.confirm('Remove this idea from the list?')) return
    setFile((f) => ({ ...f, ideas: f.ideas.filter((i) => i.id !== id) }))
  }, [])

  const handleGenerate = () => {
    const prefs =
      issue !== 'all' || format !== 'all'
        ? { issue: issue !== 'all' ? issue : undefined, format: format !== 'all' ? format : undefined }
        : {}
    const idea = generateSocialPostIdea(prefs)
    setFile((f) => ({ ...f, ideas: [idea, ...f.ideas] }))
  }

  const publish = async () => {
    setPublishStatus('publishing')
    setPublishMessage('')
    try {
      const res = await fetch('/api/protectont/social-post-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: serializeSocialPostIdeasFile(file),
      })
      const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string }
      if (!res.ok) {
        setPublishStatus('error')
        setPublishMessage(body.error || body.message || `Publish failed (${res.status})`)
        return
      }
      setPublishStatus('published')
    } catch {
      setPublishStatus('error')
      setPublishMessage('Network error — could not reach the server.')
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return file.ideas.filter((idea) => {
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
  }, [file.ideas, platform, issue, format, query])

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
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-28 sm:pt-32 pb-32">
        <header className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-[#f9e04c]/80 mb-3 font-medium">Share the movement</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#f9e04c] tracking-tight">
            Social post ideas
          </h1>
          <p className="mt-4 text-[#f9e04c]/90 font-light max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Generate new post concepts, edit headlines and captions, preview the graphic, then publish for everyone.
            Always use <span className="font-semibold text-[#ff9a3c]">{FIGHT_FORD_HASHTAG}</span>.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handleGenerate}
              className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
              style={{ backgroundColor: FF_COLORS.headingBg, color: FF_COLORS.headingText }}
            >
              Generate new idea
            </button>
            <button
              type="button"
              onClick={() => setEditMode((v) => !v)}
              className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-medium border border-[#f9e04c]/40 text-[#f9e04c] hover:bg-white/10"
            >
              {editMode ? 'Preview mode' : 'Edit mode'}
            </button>
            <Link
              href="/join"
              className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-medium border border-[#f9e04c]/40 text-[#f9e04c] hover:bg-white/10"
            >
              Get a yard sign →
            </Link>
          </div>
        </header>

        {loadStatus === 'loading' && (
          <p className="text-center text-[#f9e04c]/70 animate-pulse mb-6">Loading ideas…</p>
        )}

        {publishStatus === 'published' && (
          <p className="text-sm text-emerald-200 font-light mb-6 bg-emerald-950/50 border border-emerald-500/40 rounded-xl px-4 py-3 text-center">
            Published — everyone on this page sees your updated ideas.
          </p>
        )}
        {publishStatus === 'error' && (
          <p className="text-sm text-red-200 font-light mb-6 bg-red-950/50 border border-red-400/40 rounded-xl px-4 py-3 text-center">
            {publishMessage}
          </p>
        )}

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
            <label className="text-sm text-[#f9e04c]/80 font-light">
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
            Showing {filtered.length} of {file.ideas.length} ideas
            {issue !== 'all' || format !== 'all' ? ' — Generate uses your issue/format filters when set' : ''}
          </p>
        </section>

        {filtered.length === 0 ? (
          <p className="text-center text-[#f9e04c]/70 font-light py-12">
            No ideas match—tap <strong className="font-normal">Generate new idea</strong> or clear filters.
          </p>
        ) : (
          <section className="grid gap-6 md:grid-cols-2">
            {filtered.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                editing={editMode}
                onChange={(next) => updateIdea(idea.id, next)}
                onRemove={() => removeIdea(idea.id)}
                copiedId={copiedId}
                onCopy={copyCaption}
              />
            ))}
          </section>
        )}
      </main>

      <div className="fixed bottom-0 inset-x-0 z-20 border-t border-[#f9e04c]/25 bg-[#2a1f58]/95 backdrop-blur-sm px-4 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-xs text-[#f9e04c]/70 font-light sm:max-w-lg">
            Publish saves the full idea list to the live site. Commit{' '}
            <code className="text-[#f9e04c]/90">static/protectont/data/social-post-ideas.json</code> to git after big
            changes.
          </p>
          <button
            type="button"
            onClick={() => void publish()}
            disabled={publishStatus === 'publishing' || loadStatus === 'loading'}
            className="shrink-0 px-6 py-3.5 rounded-xl text-sm font-semibold disabled:opacity-50"
            style={{ backgroundColor: FF_COLORS.headingBg, color: FF_COLORS.headingText }}
          >
            {publishStatus === 'publishing' ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  )
}
