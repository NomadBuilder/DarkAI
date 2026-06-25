'use client'

import { getSocialGraphicContent } from '@/lib/social-graphic-content'
import { hasCustomSocialBackground } from '@/lib/social-post-images'
import type { SocialPostIdea } from '@/lib/social-post-ideas'

type Props = {
  idea: SocialPostIdea
  className?: string
}

/** On-card preview — mirrors canvas export styling at smaller scale. */
export default function SocialPostGraphicPreview({ idea, className = '' }: Props) {
  const content = getSocialGraphicContent(idea)
  const bgUrl = hasCustomSocialBackground(idea) ? idea.imageUrl!.trim() : null

  return (
    <div
      className={`relative aspect-square w-full max-h-[320px] overflow-hidden rounded-xl border border-[#2E4A6B]/20 flex flex-col ${className}`}
      style={{ background: 'linear-gradient(160deg, #152a45 0%, #2E4A6B 55%, #1e3a5f 100%)' }}
    >
      {bgUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bgUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
      ) : null}
      <div className="absolute inset-0 bg-[#152a45]/50" aria-hidden />

      <div className="relative z-10 flex flex-1 flex-col px-5 pt-4 pb-3 text-center">
        <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
          {content.issueLabel}
        </p>
        <p
          className={`mt-2 font-extrabold uppercase leading-tight text-[#f9e04c] ${
            content.template === 'meme'
              ? 'text-sm sm:text-base'
              : content.template === 'quote'
                ? 'text-[10px] sm:text-xs tracking-wider'
                : 'text-xs sm:text-sm'
          }`}
        >
          {content.headline}
        </p>
        <p
          className={`mt-3 flex-1 text-white/90 font-light leading-snug line-clamp-5 ${
            content.template === 'quote'
              ? 'text-xs sm:text-sm italic font-normal'
              : 'text-[11px] sm:text-xs'
          }`}
        >
          {content.template === 'quote' ? `"${content.body}"` : content.body}
        </p>
      </div>

      <div className="relative z-10 bg-[#f9e04c] px-3 py-2 text-center">
        <p className="text-[10px] sm:text-xs font-extrabold text-[#1a1a1a]">{content.hashtag}</p>
        <p className="text-[8px] sm:text-[9px] font-medium text-[#1a1a1a]/70">{content.site}</p>
      </div>
    </div>
  )
}
