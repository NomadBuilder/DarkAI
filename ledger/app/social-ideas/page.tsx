'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useMemo, useState } from 'react'
import TopNavigation from '@/components/TopNavigation'
import SocialIdeaCard from '@/components/social-ideas/SocialIdeaCard'
import { generateSocialPostIdea } from '@/lib/social-post-ideas-generate'
import {
  FIGHT_FORD_HASHTAG,
  ISSUE_LABELS,
  PLATFORM_LABELS,
  type FordIssue,
  type SocialPlatform,
  type SocialPostIdea,
} from '@/lib/social-post-ideas'
import { SOCIAL_SHARE_RESOURCES } from '@/lib/social-post-images'
import {
  defaultSocialPostIdeasFile,
  loadSocialPostIdeasFile,
  serializeSocialPostIdeasFile,
  type SocialPostIdeasFile,
} from '@/lib/social-post-ideas-store'

type PlatformFilter = 'all' | SocialPlatform
type IssueFilter = 'all' | FordIssue

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5 },
}

const HOW_TO_STEPS = [
  { step: '1', title: 'Pick a post', body: 'Filter by topic or platform, or browse all 16 ready-made captions.' },
  { step: '2', title: 'Copy & paste', body: 'Tap Copy post — every caption includes #FightFord. Attach a Save image if you like.' },
  { step: '3', title: 'Link to facts', body: 'Each card links to issue pages, flyers, or The Receipts for backup.' },
]

export default function SocialIdeasPage() {
  const [file, setFile] = useState<SocialPostIdeasFile>(defaultSocialPostIdeasFile())
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [editMode, setEditMode] = useState(false)
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

  const updateIdea = useCallback((id: string, next: SocialPostIdea) => {
    setFile((f) => ({
      ...f,
      ideas: f.ideas.map((i) => (i.id === id ? next : i)),
    }))
  }, [])

  const removeIdea = useCallback((id: string) => {
    if (!window.confirm('Remove this post idea?')) return
    setFile((f) => ({ ...f, ideas: f.ideas.filter((i) => i.id !== id) }))
  }, [])

  const handleGenerate = () => {
    const prefs = issue !== 'all' ? { issue } : {}
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

  const pillBase = 'shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors'
  const pillActive = `${pillBase} bg-[#2E4A6B] text-white`
  const pillIdle = `${pillBase} bg-white border border-slate-200 text-slate-700 hover:border-slate-300`

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopNavigation />

      <header className="border-b border-slate-200 bg-gradient-to-br from-slate-950 via-[#152a45] to-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 sm:pt-28 sm:pb-12">
          <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-blue-200/90 mb-3 font-medium">
            Share the movement
          </p>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight leading-tight mb-4">
            Social post ideas
          </h1>
          <p className="text-lg text-slate-200/95 font-light max-w-2xl leading-relaxed">
            Ready-made captions and graphics for Facebook, Instagram, Threads, and more — each tied to a Ford
            government issue. Copy, paste, and share with{' '}
            <span className="font-medium text-[#f9e04c]">{FIGHT_FORD_HASHTAG}</span>.
          </p>
        </div>
      </header>

      <main className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-12 ${editMode ? 'pb-28' : ''}`}>
        <motion.section {...fade} className="grid gap-4 sm:grid-cols-3">
          {HOW_TO_STEPS.map((item) => (
            <div key={item.step} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#2E4A6B]/10 text-sm font-semibold text-[#2E4A6B]">
                {item.step}
              </span>
              <h2 className="mt-3 text-lg font-light text-slate-900">{item.title}</h2>
              <p className="mt-1 text-sm text-slate-600 font-light leading-relaxed">{item.body}</p>
            </div>
          ))}
        </motion.section>

        <motion.section {...fade}>
          <h2 className="text-xl font-light text-slate-900 mb-3">More to share</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {SOCIAL_SHARE_RESOURCES.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#2E4A6B]/30 hover:shadow-md transition-all"
              >
                <h3 className="text-base font-medium text-slate-900 group-hover:text-[#2E4A6B]">{item.label}</h3>
                <p className="mt-0.5 text-sm text-slate-500 font-light">{item.blurb}</p>
              </Link>
            ))}
          </div>
        </motion.section>

        {loadStatus === 'loading' && (
          <p className="text-center text-slate-500 animate-pulse">Loading posts…</p>
        )}

        {publishStatus === 'published' && editMode && (
          <p className="text-sm text-emerald-800 font-light bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-center">
            Published — everyone on this page sees your updated posts.
          </p>
        )}
        {publishStatus === 'error' && editMode && (
          <p className="text-sm text-red-800 font-light bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center">
            {publishMessage}
          </p>
        )}

        <motion.section {...fade} className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-light text-slate-900">Post library</h2>
              <p className="text-sm text-slate-600 font-light mt-1">
                {loadStatus === 'ok' ? (
                  <>
                    {filtered.length} of {file.ideas.length} posts
                  </>
                ) : (
                  'Browse ready-made posts'
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setEditMode((v) => !v)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {editMode ? 'Done editing' : 'Edit library'}
              </button>
              {editMode && (
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="rounded-lg bg-[#2E4A6B] px-4 py-2 text-sm font-medium text-white hover:bg-[#243d56]"
                >
                  Generate post
                </button>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4 shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Topic</p>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                <button
                  type="button"
                  onClick={() => setIssue('all')}
                  className={issue === 'all' ? pillActive : pillIdle}
                >
                  All
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
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Platform</p>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                <button
                  type="button"
                  onClick={() => setPlatform('all')}
                  className={platform === 'all' ? pillActive : pillIdle}
                >
                  All
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
            </div>
            <label className="block text-sm text-slate-600 font-light">
              Search
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search captions…"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E4A6B]/25"
              />
            </label>
          </div>
        </motion.section>

        {filtered.length === 0 ? (
          <p className="text-center text-slate-500 font-light py-12">
            No posts match — try clearing filters{editMode ? ' or generate a new post' : ''}.
          </p>
        ) : (
          <section className="grid gap-6 md:grid-cols-2">
            {filtered.map((idea) => (
              <SocialIdeaCard
                key={idea.id}
                idea={idea}
                editing={editMode}
                onChange={(next) => updateIdea(idea.id, next)}
                onRemove={() => removeIdea(idea.id)}
                copiedId={copiedId}
                onCopy={copyPost}
              />
            ))}
          </section>
        )}

        <motion.section
          {...fade}
          className="rounded-2xl border border-[#2E4A6B]/25 bg-gradient-to-br from-slate-950 via-[#152a45] to-[#2E4A6B] p-8 sm:p-10 text-white shadow-lg"
        >
          <h2 className="text-2xl sm:text-3xl font-light leading-tight mb-8">Ready to take action?</h2>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <Link
              href="/flyers"
              className="inline-flex items-center justify-center rounded-xl bg-[#f9e04c] px-6 py-3 text-sm sm:text-base font-bold text-[#1a1a1a] hover:bg-[#f5d84a] transition-colors"
            >
              Printable flyers
            </Link>
            <Link
              href="/protests#event-list"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm sm:text-base font-medium text-white hover:bg-white/15 transition-colors"
            >
              Find a protest
            </Link>
            <Link
              href="/join"
              className="inline-flex items-center justify-center rounded-xl border border-[#f9e04c]/40 px-6 py-3 text-sm sm:text-base font-medium text-[#f9e04c] hover:bg-[#f9e04c]/10 transition-colors"
            >
              Join us
            </Link>
          </div>
        </motion.section>
      </main>

      {editMode && (
        <div className="fixed bottom-0 inset-x-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur-sm px-4 py-4 shadow-lg">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <p className="text-xs text-slate-600 font-light sm:max-w-lg">
              Publish saves your edits for everyone visiting protectont.ca/social-ideas.
            </p>
            <button
              type="button"
              onClick={() => void publish()}
              disabled={publishStatus === 'publishing' || loadStatus === 'loading'}
              className="shrink-0 px-6 py-3 rounded-xl text-sm font-semibold bg-[#2E4A6B] text-white hover:bg-[#243d56] disabled:opacity-50"
            >
              {publishStatus === 'publishing' ? 'Publishing…' : 'Publish changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
