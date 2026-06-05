import { SOCIAL_POST_IDEAS, type SocialPlatform, type SocialPostIdea } from './social-post-ideas'

const VALID_PLATFORMS = new Set<string>([
  'instagram',
  'facebook',
  'threads',
  'x',
  'tiktok',
  'bluesky',
])

export type SocialPostIdeasFile = {
  version: 1
  ideas: SocialPostIdea[]
}

export function defaultSocialPostIdeasFile(): SocialPostIdeasFile {
  return {
    version: 1,
    ideas: SOCIAL_POST_IDEAS.map((i) => ({ ...i })),
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

  return {
    id,
    title: typeof o.title === 'string' ? o.title : 'Untitled idea',
    issue: issue as SocialPostIdea['issue'],
    format: format as SocialPostIdea['format'],
    platforms: platforms.length ? platforms : ['instagram'],
    caption: typeof o.caption === 'string' ? o.caption : '',
    visualBrief: typeof o.visualBrief === 'string' ? o.visualBrief : '',
    designTips: typeof o.designTips === 'string' ? o.designTips : '',
    headline: typeof o.headline === 'string' ? o.headline : undefined,
    imageUrl: typeof o.imageUrl === 'string' ? o.imageUrl : undefined,
  }
}

export function parseSocialPostIdeasFile(data: unknown): SocialPostIdeasFile {
  const base = defaultSocialPostIdeasFile()
  if (!data || typeof data !== 'object') return base
  const d = data as Record<string, unknown>
  if (!Array.isArray(d.ideas)) return base
  const ideas = d.ideas
    .map((item, i) => normalizeIdea(item, i))
    .filter((x): x is SocialPostIdea => x !== null)
  return { version: 1, ideas: ideas.length ? ideas : base.ideas }
}

export function serializeSocialPostIdeasFile(file: SocialPostIdeasFile): string {
  return JSON.stringify(file, null, 2) + '\n'
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
