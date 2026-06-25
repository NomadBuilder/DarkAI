import {
  ISSUE_LABELS,
  SOCIAL_IDEAS_VERSION,
  SOCIAL_POST_IDEAS,
  cap,
  postTextWithoutHashtag,
  type SocialPlatform,
  type SocialPostIdea,
} from './social-post-ideas'

const VALID_PLATFORMS = new Set<string>([
  'instagram',
  'facebook',
  'threads',
  'x',
  'tiktok',
  'bluesky',
])

export type SocialPostIdeasFile = {
  version: number
  ideas: SocialPostIdea[]
}

export function defaultSocialPostIdeasFile(): SocialPostIdeasFile {
  return {
    version: SOCIAL_IDEAS_VERSION,
    ideas: SOCIAL_POST_IDEAS.map((i) => ({ ...i })),
  }
}

const DIRECTION_PATTERNS =
  /^(short loop|swipe carousel|meme format|side-by-side|story sticker|no image needed|15 sec|screenshot-style|scrolling ticker|real photo|drake-style|pick one issue|animation:|bold headline on|classic meme|split screen|full-screen green|standard drake|template:|text-on-screen|fake document|black bar|user-generated|n\/a —)/i

function looksLikeDirections(text: string): boolean {
  const t = text.trim()
  if (!t) return false
  if (DIRECTION_PATTERNS.test(t)) return true
  if (t.length > 120 && /purple \(#|1080×|canva|slide \d|export png/i.test(t)) return true
  return false
}

/** Turn old visual-brief bullets into readable post copy when possible */
function briefToPost(brief: string): string {
  let t = brief
    .replace(/^Animation:\s*/i, '')
    .replace(/^Slide \d+[^:]*:\s*/gi, '')
    .trim()
  t = t.replace(/→/g, '. ').replace(/\s+/g, ' ').trim()
  if (t.length > 280) t = `${t.slice(0, 277)}…`
  return cap(t)
}

function migrateIdea(raw: SocialPostIdea): SocialPostIdea {
  const byId = SOCIAL_POST_IDEAS.find((d) => d.id === raw.id)
  if (byId && looksLikeDirections(raw.caption)) {
    return { ...byId, platforms: raw.platforms.length ? raw.platforms : byId.platforms }
  }

  let caption = raw.caption
  if (looksLikeDirections(caption) && raw.visualBrief?.trim()) {
    caption = briefToPost(raw.visualBrief)
  } else if (looksLikeDirections(caption)) {
    caption = cap(postTextWithoutHashtag(raw.headline || raw.title || 'Share if you agree.'))
  }

  return {
    ...raw,
    title: ISSUE_LABELS[raw.issue] ?? raw.title,
    caption: cap(caption),
    visualBrief: undefined,
    designTips: undefined,
  }
}

function normalizeIdea(raw: unknown, index: number): SocialPostIdea | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const id =
    typeof o.id === 'string' && o.id.trim() ? o.id.trim() : `idea-${index}-${Date.now()}`
  const issue = o.issue
  const format = o.format
  if (typeof issue !== 'string' || typeof format !== 'string') return null
  const platforms: SocialPlatform[] = Array.isArray(o.platforms)
    ? o.platforms.filter((p): p is SocialPlatform => typeof p === 'string' && VALID_PLATFORMS.has(p))
    : ['instagram', 'facebook']

  const idea: SocialPostIdea = {
    id,
    title: typeof o.title === 'string' ? o.title : 'Post',
    issue: issue as SocialPostIdea['issue'],
    format: format as SocialPostIdea['format'],
    platforms: platforms.length ? platforms : ['instagram'],
    caption: typeof o.caption === 'string' ? o.caption : '',
    graphicText: typeof o.graphicText === 'string' ? o.graphicText : undefined,
    headline: typeof o.headline === 'string' ? o.headline : undefined,
    imageUrl: typeof o.imageUrl === 'string' ? o.imageUrl : undefined,
    graphicBgColor: typeof o.graphicBgColor === 'string' ? o.graphicBgColor : undefined,
    graphicBgColorEnd: typeof o.graphicBgColorEnd === 'string' ? o.graphicBgColorEnd : undefined,
    ctaBackground: typeof o.ctaBackground === 'string' ? o.ctaBackground : undefined,
    ctaPrimary: typeof o.ctaPrimary === 'string' ? o.ctaPrimary : undefined,
    ctaSecondary: typeof o.ctaSecondary === 'string' ? o.ctaSecondary : undefined,
    visualBrief: typeof o.visualBrief === 'string' ? o.visualBrief : undefined,
    designTips: typeof o.designTips === 'string' ? o.designTips : undefined,
  }

  return migrateIdea(idea)
}

export function parseSocialPostIdeasFile(data: unknown): SocialPostIdeasFile {
  const base = defaultSocialPostIdeasFile()
  if (!data || typeof data !== 'object') return base
  const d = data as Record<string, unknown>
  const version = typeof d.version === 'number' ? d.version : 0
  if (!Array.isArray(d.ideas)) return base

  const ideas = d.ideas
    .map((item, i) => normalizeIdea(item, i))
    .filter((x): x is SocialPostIdea => x !== null)

  if (version < SOCIAL_IDEAS_VERSION) {
    const byId = new Map<string, SocialPostIdea>()
    for (const item of ideas.length ? ideas.map(migrateIdea) : base.ideas) {
      byId.set(item.id, item)
    }
    for (const d of SOCIAL_POST_IDEAS) {
      if (!byId.has(d.id)) byId.set(d.id, { ...d })
    }
    return { version: SOCIAL_IDEAS_VERSION, ideas: [...byId.values()] }
  }

  return { version: SOCIAL_IDEAS_VERSION, ideas: ideas.length ? ideas : base.ideas }
}

export function serializeSocialPostIdeasFile(file: SocialPostIdeasFile): string {
  const clean: SocialPostIdeasFile = {
    version: SOCIAL_IDEAS_VERSION,
    ideas: file.ideas.map((i) => ({
      id: i.id,
      title: i.title,
      issue: i.issue,
      format: i.format,
      platforms: i.platforms,
      caption: i.caption,
      graphicText: i.graphicText,
      headline: i.headline,
      imageUrl: i.imageUrl,
      graphicBgColor: i.graphicBgColor,
      graphicBgColorEnd: i.graphicBgColorEnd,
      ctaBackground: i.ctaBackground,
      ctaPrimary: i.ctaPrimary,
      ctaSecondary: i.ctaSecondary,
    })),
  }
  return JSON.stringify(clean, null, 2) + '\n'
}

export async function loadSocialPostIdeasFile(): Promise<SocialPostIdeasFile> {
  for (const path of ['/data/social-post-ideas.json', '/api/protectont/social-post-ideas']) {
    try {
      const res = await fetch(path, { cache: 'no-store' })
      if (!res.ok) continue
      return parseSocialPostIdeasFile(await res.json())
    } catch {
      /* try next */
    }
  }
  return defaultSocialPostIdeasFile()
}
