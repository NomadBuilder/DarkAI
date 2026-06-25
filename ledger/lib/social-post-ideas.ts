export type SocialPlatform = 'instagram' | 'facebook' | 'threads' | 'x' | 'tiktok' | 'bluesky'
export type PostFormat = 'graphic' | 'meme' | 'gif' | 'carousel' | 'story' | 'reel' | 'text'
export type FordIssue =
  | 'healthcare'
  | 'education'
  | 'greenbelt'
  | 'public-land'
  | 'water'
  | 'transparency'
  | 'accountability'
  | 'ontario-place'
  | 'ring-of-fire'
  | 'foi'
  | 'bike-lanes'

export type SocialPostIdea = {
  id: string
  /** Internal label only (not shown on cards) */
  title: string
  issue: FordIssue
  format: PostFormat
  platforms: SocialPlatform[]
  /** What you paste into Facebook / Instagram — the actual post */
  caption: string
  /** Body copy rendered on the graphic (not the post caption) */
  graphicText?: string
  /** Logo mark on exported graphics (defaults to dark wordmark) */
  graphicLogoUrl?: string
  /** Optional short line on a graphic (preview only) */
  headline?: string
  imageUrl?: string
  /** Graphic background (top/left of gradient) */
  graphicBgColor?: string
  /** Graphic background gradient end */
  graphicBgColorEnd?: string
  /** Bottom CTA bar background */
  ctaBackground?: string
  /** Bottom CTA primary line (e.g. hashtag) */
  ctaPrimary?: string
  /** Bottom CTA secondary line (e.g. site URL) */
  ctaSecondary?: string
  /** @deprecated Not shown; kept for older saved JSON */
  visualBrief?: string
  designTips?: string
}

export const FIGHT_FORD_HASHTAG = '#FightFord'
export const SOCIAL_IDEAS_VERSION = 3

export const ISSUE_LABELS: Record<FordIssue, string> = {
  healthcare: 'Healthcare',
  education: 'Education',
  greenbelt: 'Greenbelt & environment',
  'public-land': 'Public land',
  water: 'Water',
  transparency: 'Transparency & receipts',
  accountability: 'Accountability',
  'ontario-place': 'Ontario Place',
  'ring-of-fire': 'Ring of Fire',
  foi: 'Freedom of information',
  'bike-lanes': 'Bike lanes & street safety',
}

export const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  threads: 'Threads',
  x: 'X (Twitter)',
  tiktok: 'TikTok',
  bluesky: 'Bluesky',
}

export const FORMAT_LABELS: Record<PostFormat, string> = {
  graphic: 'Static graphic',
  meme: 'Meme',
  gif: 'GIF / motion',
  carousel: 'Carousel',
  story: 'Story',
  reel: 'Reel / short video',
  text: 'Text-only',
}

export function cap(text: string): string {
  const base = text.trim()
  if (base.includes(FIGHT_FORD_HASHTAG)) return base
  return `${base}\n\n${FIGHT_FORD_HASHTAG}`
}

/** Caption without hashtag block — for preview body */
export function postTextWithoutHashtag(caption: string): string {
  return caption
    .replace(new RegExp(`\\s*${FIGHT_FORD_HASHTAG}\\s*`, 'gi'), '')
    .replace(/\s*protectont\.ca\s*/gi, '')
    .trim()
}

export const SOCIAL_POST_IDEAS: SocialPostIdea[] = [
  {
    id: 'hc-wait-graphic',
    title: 'Healthcare',
    issue: 'healthcare',
    format: 'graphic',
    platforms: ['instagram', 'facebook', 'threads'],
    headline: 'PUBLIC CARE. PUBLIC DOLLARS.',
    caption: cap(
      'Ontarians are waiting longer while more care shifts private. Public hospitals need public funding—not another handout to for-profit clinics. Share if your ER wait got worse.'
    ),
  },
  {
    id: 'hc-meme-ER',
    title: 'Healthcare',
    issue: 'healthcare',
    format: 'meme',
    platforms: ['facebook', 'instagram', 'x'],
    headline: 'STILL IN THE WAITING ROOM',
    caption: cap(
      'Still in the waiting room… while Ontario keeps expanding private billing. Punch up at policy, not patients.'
    ),
  },
  {
    id: 'edu-carousel',
    title: 'Education',
    issue: 'education',
    format: 'carousel',
    platforms: ['instagram', 'facebook'],
    headline: 'FUND CLASSROOMS',
    caption: cap(
      'Students need support before crisis—not after. Public dollars should stay in public schools. Swipe if you agree.'
    ),
  },
  {
    id: 'edu-gif-chalk',
    title: 'Education',
    issue: 'education',
    format: 'gif',
    platforms: ['instagram', 'facebook', 'tiktok'],
    headline: 'CLASSROOMS NOT CUTS',
    caption: cap(
      'Smaller classes → erased. More EAs → erased. Libraries → cut. Public money belongs in public schools—not excuses.'
    ),
  },
  {
    id: 'gb-before-after',
    title: 'Greenbelt',
    issue: 'greenbelt',
    format: 'graphic',
    platforms: ['instagram', 'facebook', 'threads', 'bluesky'],
    headline: 'PROTECTED LAND ≠ FOR SALE',
    caption: cap(
      'They promised to protect the Greenbelt. Then they opened it up. Farmland and watersheds are not a developer bonus—once it is paved, we do not get it back.'
    ),
  },
  {
    id: 'gb-story-poll',
    title: 'Greenbelt',
    issue: 'greenbelt',
    format: 'story',
    platforms: ['instagram', 'facebook'],
    caption: cap(
      'Should Ontario pave more farmland? Most of us say no. Hold leaders accountable—and protect what is left.'
    ),
  },
  {
    id: 'land-quote-card',
    title: 'Public land',
    issue: 'public-land',
    format: 'graphic',
    platforms: ['instagram', 'facebook', 'x'],
    headline: 'PUBLIC LAND IS NOT A GIVEAWAY',
    caption: cap(
      'Parks, wetlands, and trails belong to all of us—not behind closed doors. Public land should stay public.'
    ),
  },
  {
    id: 'water-stat-meme',
    title: 'Water',
    issue: 'water',
    format: 'meme',
    platforms: ['facebook', 'instagram', 'tiktok'],
    headline: 'CLEAN WATER NOW',
    caption: cap(
      'When the water bill lands and you wonder who is actually protecting your community. Rising costs. Weak safeguards. We deserve better.'
    ),
  },
  {
    id: 'trans-receipt-carousel',
    title: 'Transparency',
    issue: 'transparency',
    format: 'carousel',
    platforms: ['instagram', 'facebook', 'threads'],
    headline: 'SHOW THE RECEIPTS',
    caption: cap(
      'Who decided? Who benefited? What did it cost us? Ontarians deserve public records—not spin. Share if you want the receipts.'
    ),
  },
  {
    id: 'trans-gif-news',
    title: 'Transparency',
    issue: 'transparency',
    format: 'gif',
    platforms: ['instagram', 'facebook', 'x'],
    headline: 'WHO WAS IN THE ROOM?',
    caption: cap(
      'Who signed? Who paid? Who was in the room? Closed-door deals cost the public every time.'
    ),
  },
  {
    id: 'acct-yard-sign-photo',
    title: 'Accountability',
    issue: 'accountability',
    format: 'graphic',
    platforms: ['instagram', 'facebook'],
    headline: 'FORD FAILED YOU',
    caption: cap(
      'Ford Failed You — on healthcare, schools, and public land. Want a yard sign in your neighbourhood? Comment or DM and we will connect you locally.'
    ),
  },
  {
    id: 'acct-reel-15s',
    title: 'Accountability',
    issue: 'accountability',
    format: 'reel',
    platforms: ['instagram', 'tiktok', 'facebook'],
    headline: 'HOLD THEM ACCOUNTABLE',
    caption: cap(
      'One issue. One fact. One ask: tell a friend, tag your MPP, share this. Grassroots pressure still works when we show up.'
    ),
  },
  {
    id: 'hc-fb-share-text',
    title: 'Healthcare',
    issue: 'healthcare',
    format: 'text',
    platforms: ['facebook'],
    caption: cap(
      'Longer waits. Higher private bills. If you have a recent ER or specialist story, share it below—keep it local. Public care needs public capacity.'
    ),
  },
  {
    id: 'edu-threads-hot-take',
    title: 'Education',
    issue: 'education',
    format: 'text',
    platforms: ['threads', 'bluesky', 'x'],
    caption: cap('Public education is not failing—underfunding is the policy choice.'),
  },
  {
    id: 'gb-meme-drake',
    title: 'Greenbelt',
    issue: 'greenbelt',
    format: 'meme',
    platforms: ['instagram', 'facebook', 'x'],
    headline: 'PROTECT / PAVE',
    caption: cap('Protect farmland and watersheds — yes. Pave the Greenbelt for sprawl — hard no.'),
  },
  {
    id: 'multi-issue-weekly',
    title: 'Accountability',
    issue: 'accountability',
    format: 'graphic',
    platforms: ['instagram', 'facebook', 'threads', 'bluesky'],
    headline: 'ISSUE OF THE WEEK',
    caption: cap(
      'This week: healthcare waits are a policy choice—not bad luck. Share one fact with someone who votes in Ontario.'
    ),
  },
  {
    id: 'op-waterfront-graphic',
    title: 'Ontario Place',
    issue: 'ontario-place',
    format: 'graphic',
    platforms: ['instagram', 'facebook', 'threads'],
    headline: 'PUBLIC WATERFRONT ≠ PRIVATE SPA',
    caption: cap(
      'Ontario Place belongs to all of us—not a closed-door lease to a private operator. Share if you want the waterfront kept public.'
    ),
  },
  {
    id: 'op-story-poll',
    title: 'Ontario Place',
    issue: 'ontario-place',
    format: 'story',
    platforms: ['instagram', 'facebook'],
    caption: cap(
      'Would you trade public waterfront for a private spa? Most Ontarians say no. Print the flyer and talk to a neighbour.'
    ),
  },
  {
    id: 'rof-carousel',
    title: 'Ring of Fire',
    issue: 'ring-of-fire',
    format: 'carousel',
    platforms: ['instagram', 'facebook', 'threads'],
    headline: 'CONSENT COMES FIRST',
    caption: cap(
      'Major mining roads through the Ring of Fire need free, prior, and informed consent—not a rush past community objections. Swipe for the facts.'
    ),
  },
  {
    id: 'rof-meme-map',
    title: 'Ring of Fire',
    issue: 'ring-of-fire',
    format: 'meme',
    platforms: ['facebook', 'instagram', 'x'],
    headline: 'WHO BENEFITS?',
    caption: cap(
      'Billions in public infrastructure for northern mining—while communities ask who decided and who pays. Hold the process accountable.'
    ),
  },
  {
    id: 'foi-receipt-graphic',
    title: 'FOI',
    issue: 'foi',
    format: 'graphic',
    platforms: ['instagram', 'facebook', 'bluesky'],
    headline: 'SHOW THE RECORDS',
    caption: cap(
      'Rolling back freedom-of-information access makes closed-door deals easier. Ontarians deserve public records—not spin. Share the FOI flyer.'
    ),
  },
  {
    id: 'foi-text-ask',
    title: 'FOI',
    issue: 'foi',
    format: 'text',
    platforms: ['threads', 'x', 'bluesky'],
    caption: cap(
      'When FOI fees go up and deadlines slip, accountability disappears. Ask your MPP: who decided to weaken public records?'
    ),
  },
  {
    id: 'bike-lanes-graphic',
    title: 'Bike lanes',
    issue: 'bike-lanes',
    format: 'graphic',
    platforms: ['instagram', 'facebook', 'threads'],
    headline: 'EVIDENCE OVER OVERRIDES',
    caption: cap(
      'Street safety policy should follow evidence—not get overridden for politics. Bike lanes save lives. Share if your city deserves safer streets.'
    ),
  },
  {
    id: 'bike-lanes-reel',
    title: 'Bike lanes',
    issue: 'bike-lanes',
    format: 'reel',
    platforms: ['instagram', 'tiktok', 'facebook'],
    headline: 'SAFER STREETS NOW',
    caption: cap(
      'One fact: protected bike lanes reduce serious injuries. One ask: tell your councillor and MPP to stop overriding safety policy.'
    ),
  },
]

export function buildShareableCaption(idea: SocialPostIdea): string {
  return cap(idea.caption)
}
