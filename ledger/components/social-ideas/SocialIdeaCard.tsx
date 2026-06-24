'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import {
  FIGHT_FORD_HASHTAG,
  ISSUE_LABELS,
  PLATFORM_LABELS,
  buildShareableCaption,
  postTextWithoutHashtag,
  type SocialPlatform,
  type SocialPostIdea,
} from '@/lib/social-post-ideas'
import { ISSUE_RESOURCE_LINKS, resolveSocialPostImage } from '@/lib/social-post-images'

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

function IdeaGraphic({ idea }: { idea: SocialPostIdea }) {
  const image = resolveSocialPostImage(idea)
  const body = postTextWithoutHashtag(idea.caption)
  const headline = idea.headline?.trim()

  if (image && !image.startsWith('data:')) {
    return (
      <div className="relative aspect-[4/5] max-h-[320px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="h-full w-full object-contain p-2" />
        <div className="absolute bottom-0 inset-x-0 bg-[#f9e04c] py-1.5 text-center text-[10px] font-bold text-[#1a1a1a]">
          {FIGHT_FORD_HASHTAG}
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative aspect-[4/5] max-h-[320px] w-full overflow-hidden rounded-xl border border-[#2E4A6B]/20 flex flex-col"
      style={{ background: 'linear-gradient(160deg, #152a45 0%, #2E4A6B 55%, #1e3a5f 100%)' }}
    >
      {image?.startsWith('data:') ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
      ) : null}
      <div className="relative z-10 flex flex-1 flex-col justify-center p-5 text-center">
        {headline ? (
          <p className="text-sm sm:text-base font-bold uppercase tracking-wide leading-tight text-[#f9e04c]">
            {headline}
          </p>
        ) : null}
        <p
          className={`${headline ? 'mt-3 text-xs' : 'text-sm font-medium'} text-white/90 font-light leading-snug line-clamp-6`}
        >
          {body}
        </p>
      </div>
      <div className="relative z-10 bg-[#f9e04c] py-1.5 text-center text-[10px] font-bold text-[#1a1a1a]">
        {FIGHT_FORD_HASHTAG}
      </div>
    </div>
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
  const image = resolveSocialPostImage(idea)
  const resource = ISSUE_RESOURCE_LINKS[idea.issue]
  const platformStr = idea.platforms.join(', ')

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4 sm:p-5">
        <IdeaGraphic idea={idea} />

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
              <span className={labelClass}>Graphic headline (optional)</span>
              <input
                className={fieldClass}
                value={idea.headline ?? ''}
                onChange={(e) => onChange({ ...idea, headline: e.target.value || undefined })}
              />
            </div>
            <div>
              <span className={labelClass}>Image URL (optional)</span>
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
        <div className="flex flex-wrap gap-2">
          {image && !image.startsWith('data:') && (
            <a
              href={image}
              download
              className="flex-1 min-w-[7rem] text-center py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Save image
            </a>
          )}
          <Link
            href={resource.href}
            className="flex-1 min-w-[7rem] text-center py-2.5 rounded-xl text-sm font-medium border border-[#2E4A6B]/25 text-[#2E4A6B] hover:bg-[#2E4A6B]/5"
          >
            {resource.label} →
          </Link>
        </div>
      </div>
    </article>
  )
}
