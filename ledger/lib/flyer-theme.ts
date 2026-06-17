/** Per-flyer colors and backgrounds for printable posters. */
export type FlyerTheme = {
  headerColorTop: string
  headerColorBottom: string
  footerColorTop: string
  footerColorBottom: string
  bodyBackground: string
  accentColor: string
  primaryColor: string
  highlightColor: string
  headlineColor: string
  subtitleColor: string
  introColor: string
  sectionTitleColor: string
  bodyTextColor: string
  highlightTagTextColor: string
  calloutBackground: string
  calloutTitleColor: string
  footerHeadingColor: string
  footerCtaTextColor: string
}

export const DEFAULT_FLYER_THEME: FlyerTheme = {
  headerColorTop: '#3d2b7a',
  headerColorBottom: '#1e3a5f',
  footerColorTop: '#5c4899',
  footerColorBottom: '#2a1f58',
  bodyBackground: '#ffffff',
  accentColor: '#9f1239',
  primaryColor: '#3d2b7a',
  highlightColor: '#f9e04c',
  headlineColor: '#f9e04c',
  subtitleColor: '#ffffff',
  introColor: '#f3f4f6',
  sectionTitleColor: '#3d2b7a',
  bodyTextColor: '#0f172a',
  highlightTagTextColor: '#1a1a1a',
  calloutBackground: 'rgba(249, 224, 76, 0.15)',
  calloutTitleColor: '#3d2b7a',
  footerHeadingColor: '#f9e04c',
  footerCtaTextColor: '#ffffff',
}

export function resolveFlyerTheme(theme?: Partial<FlyerTheme> | null): FlyerTheme {
  if (!theme || typeof theme !== 'object') return { ...DEFAULT_FLYER_THEME }
  const merged = { ...DEFAULT_FLYER_THEME }
  for (const key of Object.keys(DEFAULT_FLYER_THEME) as (keyof FlyerTheme)[]) {
    const value = theme[key]
    if (typeof value === 'string' && value.trim()) {
      merged[key] = value.trim()
    }
  }
  return merged
}

export function parseFlyerTheme(raw: unknown): Partial<FlyerTheme> | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const o = raw as Record<string, unknown>
  const theme: Partial<FlyerTheme> = {}
  for (const key of Object.keys(DEFAULT_FLYER_THEME) as (keyof FlyerTheme)[]) {
    const value = o[key]
    if (typeof value === 'string' && value.trim()) {
      theme[key] = value.trim()
    }
  }
  return Object.keys(theme).length > 0 ? theme : undefined
}

export function headerGradient(theme: FlyerTheme): string {
  return `linear-gradient(135deg, ${theme.headerColorTop} 0%, ${theme.headerColorBottom} 100%)`
}

export function footerGradient(theme: FlyerTheme): string {
  return `linear-gradient(168deg, ${theme.footerColorTop} 0%, ${theme.footerColorBottom} 100%)`
}

/** Auto slug for new flyers — kept internal; editors never see it. */
export function slugifyFlyerTitle(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  return base || `draft-${Date.now()}`
}

export function uniqueFlyerSlug(base: string, existing: string[]): string {
  if (!existing.includes(base)) return base
  let n = 2
  while (existing.includes(`${base}-${n}`)) n++
  return `${base}-${n}`
}
