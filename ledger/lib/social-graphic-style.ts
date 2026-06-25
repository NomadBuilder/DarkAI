import { FIGHT_FORD_HASHTAG, type SocialPostIdea } from './social-post-ideas'

/** Dark-background wordmark — white Protect/.ca, green Ont */
export const DEFAULT_GRAPHIC_LOGO_URL = '/logo-icon-text-dark.svg'

/** @deprecated use DEFAULT_GRAPHIC_LOGO_URL */
export const LOGO_MARK_URL = DEFAULT_GRAPHIC_LOGO_URL

export const DEFAULT_GRAPHIC_STYLE = {
  backgroundColor: '#152a45',
  backgroundColorEnd: '#2E4A6B',
  ctaBackground: '#f9e04c',
  ctaPrimary: FIGHT_FORD_HASHTAG,
  ctaSecondary: 'protectont.ca',
} as const

export type ResolvedGraphicStyle = {
  backgroundColor: string
  backgroundColorEnd: string
  ctaBackground: string
  ctaPrimary: string
  ctaSecondary: string
}

export function resolveGraphicStyle(idea: SocialPostIdea): ResolvedGraphicStyle {
  return {
    backgroundColor: idea.graphicBgColor?.trim() || DEFAULT_GRAPHIC_STYLE.backgroundColor,
    backgroundColorEnd: idea.graphicBgColorEnd?.trim() || idea.graphicBgColor?.trim() || DEFAULT_GRAPHIC_STYLE.backgroundColorEnd,
    ctaBackground: idea.ctaBackground?.trim() || DEFAULT_GRAPHIC_STYLE.ctaBackground,
    ctaPrimary: idea.ctaPrimary?.trim() || DEFAULT_GRAPHIC_STYLE.ctaPrimary,
    ctaSecondary: idea.ctaSecondary?.trim() || DEFAULT_GRAPHIC_STYLE.ctaSecondary,
  }
}

export function resolveGraphicLogoUrl(idea: SocialPostIdea): string {
  const custom = idea.graphicLogoUrl?.trim()
  return custom || DEFAULT_GRAPHIC_LOGO_URL
}

export const BACKGROUND_PRESETS = [
  { id: 'navy', label: 'Navy', bg: '#152a45', end: '#2E4A6B' },
  { id: 'purple', label: 'Purple', bg: '#3d2b7a', end: '#2a1f58' },
  { id: 'slate', label: 'Slate', bg: '#0f172a', end: '#1e293b' },
  { id: 'forest', label: 'Forest', bg: '#14532d', end: '#166534' },
] as const
