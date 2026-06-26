'use client'

import { getSocialGraphicContent } from '@/lib/social-graphic-content'
import { hasCustomSocialBackground } from '@/lib/social-post-images'
import { resolveGraphicLogoUrl, resolveGraphicStyle } from '@/lib/social-graphic-style'
import type { SocialPostIdea } from '@/lib/social-post-ideas'

type Props = {
  idea: SocialPostIdea
  className?: string
}

/** On-card preview — mirrors canvas export styling at smaller scale. */
export default function SocialPostGraphicPreview({ idea, className = '' }: Props) {
  const hasImage = hasCustomSocialBackground(idea)
  const content = getSocialGraphicContent(idea)
  const style = resolveGraphicStyle(idea)
  const logoUrl = resolveGraphicLogoUrl(idea)
  const bgUrl = hasImage ? idea.imageUrl!.trim() : null

  const textScale = hasImage ? '' : 'scale-[1.08] origin-center'

  return (
    <div
      className={`relative aspect-square w-full max-h-[320px] overflow-hidden rounded-xl border border-[#2E4A6B]/20 flex flex-col ${className}`}
      style={{
        background: `linear-gradient(160deg, ${style.backgroundColor} 0%, ${style.backgroundColorEnd} 55%, ${style.backgroundColor} 100%)`,
      }}
    >
      {bgUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bgUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
      ) : null}
      {bgUrl ? (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `${style.backgroundColor}88` }}
          aria-hidden
        />
      ) : null}

      <div className="relative z-10 flex flex-col items-center px-4 pt-2 pb-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt=""
          className="h-9 sm:h-11 w-auto max-w-[88%] object-contain drop-shadow-sm"
        />
      </div>

      <div
        className={`relative z-10 flex flex-1 flex-col px-5 pb-3 text-center ${
          hasImage ? 'justify-start pt-1' : 'justify-center'
        } ${textScale}`}
      >
        <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
          {content.issueLabel}
        </p>
        <p
          className={`mt-2 font-extrabold uppercase leading-tight text-[#f9e04c] ${
            hasImage
              ? content.template === 'meme'
                ? 'text-sm sm:text-base'
                : content.template === 'quote'
                  ? 'text-[10px] sm:text-xs tracking-wider'
                  : 'text-xs sm:text-sm'
              : content.template === 'meme'
                ? 'text-base sm:text-lg'
                : content.template === 'quote'
                  ? 'text-xs sm:text-sm tracking-wider'
                  : 'text-sm sm:text-base'
          }`}
        >
          {content.headline}
        </p>
        <p
          className={`mt-3 text-white/90 font-light leading-snug ${
            hasImage ? 'line-clamp-5' : 'line-clamp-8'
          } ${
            hasImage
              ? content.template === 'quote'
                ? 'text-xs sm:text-sm italic font-normal'
                : 'text-[11px] sm:text-xs'
              : content.template === 'quote'
                ? 'text-sm sm:text-base italic font-normal'
                : 'text-sm sm:text-base leading-snug'
          }`}
        >
          {content.template === 'quote' ? `"${content.body}"` : content.body}
        </p>
      </div>

      <div
        className="relative z-10 px-3 py-2 text-center shrink-0"
        style={{ backgroundColor: style.ctaBackground }}
      >
        <p className="text-[10px] sm:text-xs font-extrabold text-[#1a1a1a]">{style.ctaPrimary}</p>
        <p className="text-[8px] sm:text-[9px] font-medium text-[#1a1a1a]/70">{style.ctaSecondary}</p>
      </div>
    </div>
  )
}
