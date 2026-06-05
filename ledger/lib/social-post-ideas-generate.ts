import {
  FIGHT_FORD_HASHTAG,
  FORMAT_LABELS,
  ISSUE_LABELS,
  type FordIssue,
  type PostFormat,
  type SocialPlatform,
  type SocialPostIdea,
} from './social-post-ideas'

const ISSUES = Object.keys(ISSUE_LABELS) as FordIssue[]
const FORMATS = Object.keys(FORMAT_LABELS) as PostFormat[]
const ALL_PLATFORMS: SocialPlatform[] = ['instagram', 'facebook', 'threads', 'x', 'tiktok', 'bluesky']

const HEADLINES: Record<FordIssue, string[]> = {
  healthcare: ['PUBLIC CARE NOW', 'WAIT TIMES ARE POLICY', 'STOP THE TWO-TIER SHIFT', 'HOSPITALS NEED STAFF'],
  education: ['FUND OUR SCHOOLS', 'CLASSROOMS NOT CUTS', 'PUBLIC EDUCATION MATTERS', 'SUPPORT TEACHERS'],
  greenbelt: ['PROTECT THE GREENBELT', 'FARMLAND NOT SPRAWL', 'PAVED PROMISES', 'NATURE IS NOT FOR SALE'],
  'public-land': ['PUBLIC LAND STAYS PUBLIC', 'OUR PARKS OUR RULES', 'STOP THE GIVEAWAY', 'LAND IS FOR PEOPLE'],
  water: ['CLEAN WATER NOW', 'BILLS ARE TOO HIGH', 'PROTECT WATERSHEDS', 'WATER IS A RIGHT'],
  transparency: ['SHOW THE RECEIPTS', 'WHO BENEFITED?', 'CLOSED DOORS COST US', 'FOLLOW THE MONEY'],
  accountability: ['FORD FAILED YOU', 'HOLD THEM ACCOUNTABLE', 'ONTARIO DESERVES BETTER', 'WE SEE YOU'],
}

const HOOKS = [
  'One fact. One frame. Share it.',
  'Keep it local—name your city in the caption.',
  'Policy hurts real people; make it concrete.',
  'Ask a question in the caption to boost comments.',
  'Pair this with a link in the first comment.',
]

const VISUAL_STARTERS: Record<PostFormat, string[]> = {
  graphic: [
    'Bold headline on purple (#3d2b7a) with yellow (#f9e04c) type; one icon for {issue}.',
    'Single-stat poster: big number or short quote, orange (#ff9a3c) underline.',
    'Photo background + dark overlay; headline centered in yellow caps.',
  ],
  meme: [
    'Top/bottom meme text—punch at policy, not patients or students.',
    'Drake-style two-panel: good choice vs bad choice for {issue}.',
    'Reaction image + 8-word max overlay about {issue}.',
  ],
  gif: [
    '3–5 sec loop: text appears line by line, ends on {hashtag}.',
    'Simple animation: ticker headlines about {issue}.',
    'Before/after wipe: protected vs developed land.',
  ],
  carousel: [
    'Slide 1 hook, slides 2–3 one fact each, slide 4 CTA to protectont.ca.',
    'Swipe series: problem → who decided → what we want → share.',
  ],
  story: [
    'Full-screen purple gradient, poll or question sticker, link sticker to /join.',
    '15 sec story: headline → one sentence → swipe up.',
  ],
  reel: [
    'Vertical 9:16, burned-in captions, hook in first 2 seconds.',
    'Text-on-screen only—no camera needed; beat sync optional.',
  ],
  text: [
    'N/A—strong opening line, 2 short paragraphs, end with question.',
  ],
}

const CAPTION_TEMPLATES: Record<FordIssue, string[]> = {
  healthcare: [
    'Longer waits. Higher private bills. Ontario needs public capacity—not another handout to for-profit care. Share if you agree.',
    'If your ER wait got worse, you are not imagining it. Talk about {issue} locally and tag your MPP.',
  ],
  education: [
    'Kids need support before crisis. Public dollars should stay in public classrooms.',
    'Underfunding is a choice. Parents and teachers see it every day—share one classroom fact.',
  ],
  greenbelt: [
    'Protected land should stay protected. Once it is paved, we do not get it back.',
    'Farmland and watersheds are not a developer bonus. Tell your friends why this matters.',
  ],
  'public-land': [
    'Public land is not a giveaway. Parks and wetlands belong to all of us.',
    'If a decision happened behind closed doors, ask who benefited—then share.',
  ],
  water: [
    'Water bills and weak safeguards hit communities first. One clear post beats a rant.',
    'Clean water is basic infrastructure—not a luxury add-on.',
  ],
  transparency: [
    'Show the receipts. Ontarians deserve to see who decided and who paid.',
    'Closed-door deals cost the public. Link people to the facts.',
  ],
  accountability: [
    'Ford failed you on healthcare, schools, and public land. Yard signs and shares add up.',
    'Grassroots pressure works when we stay visible—share this in your group.',
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

function issueLabel(issue: FordIssue): string {
  return ISSUE_LABELS[issue].toLowerCase()
}

function capCaption(text: string): string {
  const t = text.trim()
  return t.includes(FIGHT_FORD_HASHTAG) ? t : `${t}\n\n${FIGHT_FORD_HASHTAG}`
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
      ? pickN(
          ['facebook', 'threads', 'x', 'bluesky'] as SocialPlatform[],
          2
        )
      : format === 'reel'
        ? pickN(['instagram', 'tiktok', 'facebook'] as SocialPlatform[], 2)
        : pickN(ALL_PLATFORMS, Math.random() > 0.5 ? 3 : 2)

  const headline = pick(HEADLINES[issue])
  const hook = pick(HOOKS)
  const visualStarter = pick(VISUAL_STARTERS[format])
  const captionBase = pick(CAPTION_TEMPLATES[issue]).replace(/\{issue\}/g, issueLabel(issue))

  const visualBrief = visualStarter
    .replace(/\{issue\}/g, issueLabel(issue))
    .replace(/\{hashtag\}/g, FIGHT_FORD_HASHTAG)

  const formatLabel = FORMAT_LABELS[format].toLowerCase()

  return {
    id: newId(),
    title: `New ${formatLabel}: ${ISSUE_LABELS[issue]}`,
    issue,
    format,
    platforms,
    headline,
    caption: capCaption(`${captionBase} protectont.ca`),
    visualBrief: `${visualBrief} ${hook}`,
    designTips: `Format: ${FORMAT_LABELS[format]}. Platforms: ${platforms.map((p) => p).join(', ')}. Keep one message; add ProtectOnt.ca on the last slide or in comments.`,
  }
}
