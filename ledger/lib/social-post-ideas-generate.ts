import {
  FIGHT_FORD_HASHTAG,
  ISSUE_LABELS,
  cap,
  type FordIssue,
  type PostFormat,
  type SocialPlatform,
  type SocialPostIdea,
} from './social-post-ideas'

const ISSUES = Object.keys(ISSUE_LABELS) as FordIssue[]
const FORMATS: PostFormat[] = ['graphic', 'meme', 'gif', 'carousel', 'story', 'reel', 'text']
const ALL_PLATFORMS: SocialPlatform[] = ['instagram', 'facebook', 'threads', 'x', 'tiktok', 'bluesky']

const HEADLINES: Record<FordIssue, string[]> = {
  healthcare: ['PUBLIC CARE NOW', 'WAIT TIMES ARE POLICY', 'STOP THE TWO-TIER SHIFT'],
  education: ['FUND OUR SCHOOLS', 'CLASSROOMS NOT CUTS', 'SUPPORT TEACHERS'],
  greenbelt: ['PROTECT THE GREENBELT', 'FARMLAND NOT SPRAWL', 'NATURE IS NOT FOR SALE'],
  'public-land': ['PUBLIC LAND STAYS PUBLIC', 'OUR PARKS OUR RULES', 'STOP THE GIVEAWAY'],
  water: ['CLEAN WATER NOW', 'BILLS ARE TOO HIGH', 'WATER IS A RIGHT'],
  transparency: ['SHOW THE RECEIPTS', 'WHO BENEFITED?', 'FOLLOW THE MONEY'],
  accountability: ['FORD FAILED YOU', 'HOLD THEM ACCOUNTABLE', 'ONTARIO DESERVES BETTER'],
}

const POSTS: Record<FordIssue, string[]> = {
  healthcare: [
    'Longer waits. Higher private bills. Ontario needs public capacity in public hospitals—not another shift to for-profit care.',
    'If your ER wait got worse, you are not imagining it. Tag your MPP and share what you are seeing locally.',
    'Public care. Public dollars. No more two-tier surprises.',
  ],
  education: [
    'Kids need support before crisis—not after. Fund public classrooms, not excuses.',
    'Smaller classes matter. EAs matter. Libraries matter. Underfunding is a choice.',
    'Parents and teachers see the cuts every day. Share one fact from your school.',
  ],
  greenbelt: [
    'Protected land should stay protected. Once it is paved, we do not get it back.',
    'Farmland and watersheds are not a developer bonus. Tell your friends why this matters.',
    'The Greenbelt was a promise. Breaking it hurts every community downstream.',
  ],
  'public-land': [
    'Public land is not a giveaway. Parks and wetlands belong to all of us.',
    'If a decision happened behind closed doors, ask who benefited—then share.',
    'Trails, forests, and shorelines are not optional extras—they are public trust.',
  ],
  water: [
    'Water bills are climbing and safeguards are weak. Communities pay first.',
    'Clean water is basic infrastructure—not a luxury add-on.',
    'Protect watersheds now or pay more later. Share if you agree.',
  ],
  transparency: [
    'Show the receipts. Ontarians deserve to see who decided and who paid.',
    'Closed-door deals cost the public. Link people to the facts, not the spin.',
    'Who was in the room? Who signed? Who benefited? Ask out loud.',
  ],
  accountability: [
    'Ford failed you on healthcare, schools, and public land. Yard signs and shares add up.',
    'Grassroots pressure works when we stay visible—one share, one conversation.',
    'Tell a friend what is at stake in Ontario this year. Then tag #FightFord.',
  ],
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  const out: T[] = []
  while (out.length < n && copy.length) {
    const i = Math.floor(Math.random() * copy.length)
    out.push(copy.splice(i, 1)[0])
  }
  return out
}

function newId(): string {
  return `idea-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export type GeneratePrefs = {
  issue?: FordIssue
  format?: PostFormat
}

export function generateSocialPostIdea(prefs: GeneratePrefs = {}): SocialPostIdea {
  const issue = prefs.issue ?? pick(ISSUES)
  const format = prefs.format ?? pick(FORMATS)
  const platforms =
    format === 'text'
      ? pickN(['facebook', 'threads', 'x', 'bluesky'] as SocialPlatform[], 2)
      : format === 'reel'
        ? pickN(['instagram', 'tiktok', 'facebook'] as SocialPlatform[], 2)
        : pickN(ALL_PLATFORMS, Math.random() > 0.5 ? 3 : 2)

  const headline = pick(HEADLINES[issue])
  const postBody = pick(POSTS[issue])

  return {
    id: newId(),
    title: ISSUE_LABELS[issue],
    issue,
    format,
    platforms,
    headline,
    caption: cap(postBody),
  }
}
