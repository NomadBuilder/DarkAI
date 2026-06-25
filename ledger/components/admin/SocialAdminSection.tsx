'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import SocialIdeaCard from '@/components/social-ideas/SocialIdeaCard'
import SocialPostBuilder from '@/components/admin/SocialPostBuilder'
import { generateSocialPostIdea } from '@/lib/social-post-ideas-generate'
import {
  ISSUE_LABELS,
  PLATFORM_LABELS,
  type FordIssue,
  type SocialPlatform,
  type SocialPostIdea,
} from '@/lib/social-post-ideas'
import {
  defaultSocialPostIdeasFile,
  loadSocialPostIdeasFile,
  serializeSocialPostIdeasFile,
  type SocialPostIdeasFile,
} from '@/lib/social-post-ideas-store'

type PlatformFilter = 'all' | SocialPlatform
type IssueFilter = 'all' | FordIssue

type Props = {
  embedded?: boolean
}

export default function SocialAdminSection({ embedded: _embedded = true }: Props) {
  const libraryRef = useRef<HTMLElement>(null)
  const [file, setFile] = useState<SocialPostIdeasFile>(defaultSocialPostIdeasFile())
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [platform, setPlatform] = useState<PlatformFilter>('all')
  const [issue, setIssue] = useState<IssueFilter>('all')
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

  const scrollToLibrary = useCallback(() => {
    libraryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const updateIdea = useCallback((id: string, next: SocialPostIdea) => {
    setFile((f) => ({
      ...f,
      ideas: f.ideas.map((i) => (i.id === id ? next : i)),
    }))
    setPublishStatus('idle')
  }, [])

  const removeIdea = useCallback((id: string) => {
    if (!window.confirm('Remove this post from the library?')) return
    setFile((f) => ({ ...f, ideas: f.ideas.filter((i) => i.id !== id) }))
    setPublishStatus('idle')
  }, [])

  const addToLibrary = useCallback(
    (idea: SocialPostIdea) => {
      setFile((f) => ({ ...f, ideas: [idea, ...f.ideas] }))
      setPublishStatus('idle')
      window.setTimeout(scrollToLibrary, 100)
    },
    [scrollToLibrary]
  )

  const handleGenerate = () => {
    const prefs = issue !== 'all' ? { issue } : {}
    addToLibrary(generateSocialPostIdea(prefs))
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
        setPublishMessage(body.error || body.message || `Save failed (${res.status})`)
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
      if (platform !== 'all' && !idea.platforms.includes(platform)) return false
      if (!q) return true
      const hay = [idea.caption, idea.headline ?? '', ISSUE_LABELS[idea.issue]].join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [file.ideas, platform, issue, query])

  const copyPost = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      window.setTimeout(() => setCopiedId(null), 2000)
    } catch {
      window.prompt('Copy this post:', text)
    }
  }

  const pillActive = 'rounded-full px-3.5 py-1.5 text-sm font-medium bg-[#3d2b7a] text-white'
  const pillIdle =
    'rounded-full px-3.5 py-1.5 text-sm font-medium bg-white border border-slate-200 text-slate-700 hover:border-slate-300'

  return (
    <div className="space-y-10">
      {publishStatus === 'published' && (
        <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          Library saved to the server.
        </p>
      )}
      {publishStatus === 'error' && (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {publishMessage}
        </p>
      )}

      <section aria-labelledby="social-builder-heading">
        <h3 id="social-builder-heading" className="text-lg font-medium text-slate-900 mb-1">
          Create a new post
        </h3>
        <p className="text-sm text-slate-600 font-light mb-5">
          Build a one-off graphic, or save it to the library below.
        </p>
        <SocialPostBuilder onSaveToLibrary={addToLibrary} />
      </section>

      <section
        ref={libraryRef}
        aria-labelledby="social-library-heading"
        className="scroll-mt-6 border-t border-slate-200 pt-10 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h3 id="social-library-heading" className="text-lg font-medium text-slate-900">
              Post library
            </h3>
            <p className="text-sm text-slate-600 font-light mt-1">
              {loadStatus === 'loading' && 'Loading saved posts…'}
              {loadStatus === 'error' && 'Could not load library — showing built-in defaults.'}
              {loadStatus === 'ok' && (
                <>
                  {filtered.length === file.ideas.length
                    ? `${file.ideas.length} ready-to-use posts`
                    : `${filtered.length} of ${file.ideas.length} posts`}
                  . Copy captions or download graphics for Instagram and Facebook.
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={scrollToLibrary}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Jump to library
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Auto-generate draft
            </button>
            <button
              type="button"
              onClick={() => void publish()}
              disabled={publishStatus === 'publishing' || loadStatus === 'loading'}
              className="rounded-lg bg-[#3d2b7a] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a1f58] disabled:opacity-50"
            >
              {publishStatus === 'publishing' ? 'Saving…' : 'Save library to server'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setIssue('all')} className={issue === 'all' ? pillActive : pillIdle}>
              All topics
            </button>
            {(Object.keys(ISSUE_LABELS) as FordIssue[]).map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIssue(i)}
                className={issue === i ? pillActive : pillIdle}
              >
                {ISSUE_LABELS[i]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPlatform('all')}
              className={platform === 'all' ? pillActive : pillIdle}
            >
              All platforms
            </button>
            {(Object.keys(PLATFORM_LABELS) as SocialPlatform[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                className={platform === p ? pillActive : pillIdle}
              >
                {PLATFORM_LABELS[p]}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search captions…"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
        </div>

        {loadStatus === 'loading' ? (
          <p className="text-center text-slate-500 font-light py-10 animate-pulse">Loading post library…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-slate-500 font-light py-10">
            No posts match your filters — try clearing search or topic filters.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filtered.map((idea) => (
              <SocialIdeaCard
                key={idea.id}
                idea={idea}
                editing
                adminMode
                onChange={(next) => updateIdea(idea.id, next)}
                onRemove={() => removeIdea(idea.id)}
                copiedId={copiedId}
                onCopy={copyPost}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
