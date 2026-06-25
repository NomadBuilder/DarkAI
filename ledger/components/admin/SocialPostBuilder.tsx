'use client'

import { useMemo, useState } from 'react'
import SocialGraphicStyleFields from '@/components/admin/SocialGraphicStyleFields'
import SocialPostGraphicPreview from '@/components/social-ideas/SocialPostGraphicPreview'
import { downloadSocialGraphic, renderSocialGraphicDataUrl } from '@/lib/render-social-graphic'
import {
  FIGHT_FORD_HASHTAG,
  ISSUE_LABELS,
  buildShareableCaption,
  cap,
  type FordIssue,
  type SocialPlatform,
  type SocialPostIdea,
} from '@/lib/social-post-ideas'

const PRIMARY_PLATFORMS: SocialPlatform[] = ['instagram', 'facebook']

function newDraft(issue: FordIssue = 'healthcare'): SocialPostIdea {
  return {
    id: `draft-${Date.now()}`,
    title: ISSUE_LABELS[issue],
    issue,
    format: 'graphic',
    platforms: ['instagram', 'facebook'],
    headline: '',
    caption: '',
  }
}

type Props = {
  onSaveToLibrary: (idea: SocialPostIdea) => void
}

export default function SocialPostBuilder({ onSaveToLibrary }: Props) {
  const [draft, setDraft] = useState<SocialPostIdea>(() => newDraft())
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  const shareCaption = useMemo(() => {
    const text = draft.caption.trim()
    if (!text) return FIGHT_FORD_HASHTAG
    return buildShareableCaption({ ...draft, caption: cap(text) })
  }, [draft])

  const togglePlatform = (platform: SocialPlatform) => {
    setDraft((d) => {
      const has = d.platforms.includes(platform)
      const platforms = has ? d.platforms.filter((p) => p !== platform) : [...d.platforms, platform]
      return { ...d, platforms: platforms.length ? platforms : ['instagram'] }
    })
  }

  const handleCopy = async () => {
    if (!draft.caption.trim()) {
      window.alert('Write a caption first — even a short line works.')
      return
    }
    try {
      await navigator.clipboard.writeText(shareCaption)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this caption:', shareCaption)
    }
  }

  const handleDownload = async () => {
    if (!draft.caption.trim() && !draft.headline?.trim()) {
      window.alert('Add a headline or caption so the graphic has something to show.')
      return
    }
    setDownloading(true)
    try {
      const dataUrl = await renderSocialGraphicDataUrl(draft)
      downloadSocialGraphic(draft, dataUrl)
    } catch {
      window.alert('Could not generate the image. Try again.')
    } finally {
      setDownloading(false)
    }
  }

  const handleSave = () => {
    if (!draft.caption.trim()) {
      window.alert('Add a caption before saving to the library.')
      return
    }
    const idea: SocialPostIdea = {
      ...draft,
      id: `idea-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: ISSUE_LABELS[draft.issue],
      caption: cap(draft.caption.trim()),
    }
    onSaveToLibrary(idea)
    setSavedFlash(true)
    window.setTimeout(() => setSavedFlash(false), 2500)
    setDraft(newDraft(draft.issue))
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-violet-200 bg-violet-50/60 px-4 py-3 text-sm text-violet-950 font-light">
        <strong className="font-medium">How it works:</strong> pick a topic, write a short headline and caption, preview
        the branded square graphic, then copy the caption and download the image for Instagram or Facebook.
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">1. Topic</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(ISSUE_LABELS) as FordIssue[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, issue: key, title: ISSUE_LABELS[key] }))}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    draft.issue === key
                      ? 'bg-[#3d2b7a] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {ISSUE_LABELS[key]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              2. Graphic headline
            </label>
            <input
              value={draft.headline ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, headline: e.target.value }))}
              placeholder="e.g. PUBLIC CARE NOW"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
            <p className="mt-1 text-xs text-slate-500 font-light">Short, punchy — shows big on the image.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              3. Caption (paste into the post)
            </label>
            <textarea
              rows={5}
              value={draft.caption.replace(new RegExp(`\\s*${FIGHT_FORD_HASHTAG}\\s*`, 'gi'), '').trim()}
              onChange={(e) => setDraft((d) => ({ ...d, caption: e.target.value }))}
              placeholder="What you want people to read on Instagram or Facebook…"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
            <p className="mt-1 text-xs text-slate-500 font-light">
              {FIGHT_FORD_HASHTAG} is added automatically when you copy.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">4. Platforms</p>
            <div className="flex flex-wrap gap-2">
              {PRIMARY_PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    draft.platforms.includes(p)
                      ? 'bg-[#2E4A6B] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p === 'instagram' ? 'Instagram' : 'Facebook'}
                </button>
              ))}
            </div>
          </div>

          <SocialGraphicStyleFields idea={draft} onChange={setDraft} />
        </div>

        <div className="space-y-4 lg:sticky lg:top-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Live preview</p>
          <SocialPostGraphicPreview idea={draft} className="max-h-none mx-auto max-w-sm" />

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Caption preview</p>
            <p className="text-sm text-slate-800 font-light whitespace-pre-wrap leading-relaxed">
              {shareCaption || 'Your caption will appear here…'}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="w-full py-3.5 rounded-xl text-sm font-semibold bg-[#3d2b7a] text-white hover:bg-[#2a1f58] transition-colors"
            >
              {copied ? 'Caption copied!' : 'Copy caption'}
            </button>
            <button
              type="button"
              onClick={() => void handleDownload()}
              disabled={downloading}
              className="w-full py-3 rounded-xl text-sm font-medium border border-[#2E4A6B]/30 text-[#2E4A6B] hover:bg-[#2E4A6B]/5 disabled:opacity-60"
            >
              {downloading ? 'Generating image…' : 'Download graphic (1080×1080)'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-3 rounded-xl text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              {savedFlash ? 'Saved to library ✓' : 'Save to library'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
