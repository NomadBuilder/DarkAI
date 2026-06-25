'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import SocialPostGraphicPreview from '@/components/social-ideas/SocialPostGraphicPreview'
import {
  ISSUE_LABELS,
  PLATFORM_LABELS,
  buildShareableCaption,
  type SocialPlatform,
  type SocialPostIdea,
} from '@/lib/social-post-ideas'
import { downloadSocialGraphic, renderSocialGraphicDataUrl } from '@/lib/render-social-graphic'
import { ISSUE_FLYER_LINKS, ISSUE_RESOURCE_LINKS } from '@/lib/social-post-images'

const fieldClass =
  'w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E4A6B]/30'
const labelClass = 'block text-xs uppercase tracking-wider text-slate-500 mb-1'

function PlatformBadge({ platform }: { platform: SocialPlatform }) {
  return (
    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
      {PLATFORM_LABELS[platform]}
    </span>
  )
}

function CollapsibleDetails({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-4 border-t border-slate-100 pt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 py-2 text-left text-sm font-medium text-[#2E4A6B] hover:text-[#243d56]"
        aria-expanded={open}
      >
        {title}
        <span className="text-slate-400" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && <div className="space-y-3 mt-3">{children}</div>}
    </div>
  )
}

type Props = {
  idea: SocialPostIdea
  editing: boolean
  onChange: (next: SocialPostIdea) => void
  onRemove: () => void
  copiedId: string | null
  onCopy: (id: string, text: string) => void
}

export default function SocialIdeaCard({ idea, editing, onChange, onRemove, copiedId, onCopy }: Props) {
  const post = buildShareableCaption(idea)
  const resource = ISSUE_RESOURCE_LINKS[idea.issue]
  const flyer = ISSUE_FLYER_LINKS[idea.issue]
  const platformStr = idea.platforms.join(', ')
  const [downloading, setDownloading] = useState(false)

  const handleDownloadGraphic = async () => {
    setDownloading(true)
    try {
      const dataUrl = await renderSocialGraphicDataUrl(idea)
      downloadSocialGraphic(idea, dataUrl)
    } catch {
      window.alert('Could not generate graphic. Try again.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4 sm:p-5">
        <SocialPostGraphicPreview idea={idea} />

        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center rounded-md bg-[#2E4A6B]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#2E4A6B]">
            {ISSUE_LABELS[idea.issue]}
          </span>
          {idea.platforms.map((p) => (
            <PlatformBadge key={p} platform={p} />
          ))}
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-4">
          <p className="text-sm text-slate-800 font-light leading-relaxed whitespace-pre-wrap">{post}</p>
        </div>

        {editing && (
          <CollapsibleDetails title="Edit post">
            <div>
              <span className={labelClass}>Caption</span>
              <textarea
                rows={5}
                className={`${fieldClass} resize-y`}
                value={idea.caption}
                onChange={(e) => onChange({ ...idea, caption: e.target.value })}
              />
            </div>
            <div>
              <span className={labelClass}>Graphic headline (shown on image)</span>
              <input
                className={fieldClass}
                value={idea.headline ?? ''}
                onChange={(e) => onChange({ ...idea, headline: e.target.value || undefined })}
                placeholder="Short punchy line — e.g. PUBLIC CARE NOW"
              />
            </div>
            <div>
              <span className={labelClass}>Background photo (optional)</span>
              <input
                className={fieldClass}
                value={idea.imageUrl?.startsWith('data:') ? '' : idea.imageUrl ?? ''}
                onChange={(e) => onChange({ ...idea, imageUrl: e.target.value || undefined })}
                placeholder="https://… or upload below"
              />
              <input
                type="file"
                accept="image/*"
                className="mt-2 block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700"
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
            <button
              type="button"
              onClick={onRemove}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Remove post
            </button>
          </CollapsibleDetails>
        )}
      </div>

      <div className="mt-auto border-t border-slate-100 p-4 sm:p-5 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => onCopy(idea.id, post)}
          className="w-full py-3 rounded-xl text-sm font-semibold bg-[#2E4A6B] text-white hover:bg-[#243d56] transition-colors"
        >
          {copiedId === idea.id ? 'Copied to clipboard!' : 'Copy post'}
        </button>
        <button
          type="button"
          onClick={handleDownloadGraphic}
          disabled={downloading}
          className="w-full py-2.5 rounded-xl text-sm font-medium border border-[#2E4A6B]/30 text-[#2E4A6B] hover:bg-[#2E4A6B]/5 transition-colors disabled:opacity-60"
        >
          {downloading ? 'Generating…' : 'Download graphic (1080×1080)'}
        </button>
        <div className="flex flex-wrap gap-2">
          <Link
            href={resource.href}
            className="flex-1 min-w-[7rem] text-center py-2.5 rounded-xl text-sm font-medium border border-[#2E4A6B]/25 text-[#2E4A6B] hover:bg-[#2E4A6B]/5"
          >
            {resource.label} →
          </Link>
          {flyer ? (
            <Link
              href={flyer.href}
              className="flex-1 min-w-[7rem] text-center py-2.5 rounded-xl text-sm font-medium border border-[#2E4A6B]/25 text-[#2E4A6B] hover:bg-[#2E4A6B]/5"
            >
              {flyer.label} →
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  )
}
