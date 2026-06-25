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
  healthcare: ['PUBLIC CARE NOW', 'WOMEN PAY TWICE', 'PUBLIC CARE IS SHARED CARE', 'THE BILL GOES HOME'],
  education: ['FUND OUR SCHOOLS', 'CLASSROOMS NOT CUTS', 'SUPPORT TEACHERS'],
  greenbelt: ['PROTECT THE GREENBELT', 'FARMLAND NOT SPRAWL', 'NATURE IS NOT FOR SALE'],
  'public-land': ['PUBLIC LAND STAYS PUBLIC', 'OUR PARKS OUR RULES', 'STOP THE GIVEAWAY'],
  water: ['CLEAN WATER NOW', 'BILLS ARE TOO HIGH', 'WATER IS A RIGHT'],
  transparency: ['SHOW THE RECEIPTS', 'WHO BENEFITED?', 'FOLLOW THE MONEY'],
  accountability: ['FORD FAILED YOU', 'HOLD THEM ACCOUNTABLE', 'ONTARIO DESERVES BETTER'],
  'ontario-place': ['PUBLIC WATERFRONT', 'NOT FOR SALE', 'KEEP ONTARIO PLACE PUBLIC'],
  'ring-of-fire': ['CONSENT COMES FIRST', 'WHO DECIDED?', 'COMMUNITY NOT CORPORATE'],
  foi: ['SHOW THE RECORDS', 'OPEN THE BOOKS', 'FOI IS A RIGHT'],
  'bike-lanes': ['SAFER STREETS NOW', 'EVIDENCE OVER POLITICS', 'PROTECT BIKE LANES'],
}

const POSTS: Record<FordIssue, string[]> = {
  healthcare: [
    'Longer waits. Higher private bills. Ontario needs public capacity in public hospitals—not another shift to for-profit care.',
    'When public care is cut, the load lands unevenly — at work (mostly women in feminized jobs) and at home (unpaid caregiving). Share the flyer.',
    'Bill 124 capped wages while agencies captured billions. Public care is shared care — not a private bill sent home.',
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
  'ontario-place': [
    'Ontario Place belongs to all of us—not a closed-door lease. Share if you want the waterfront kept public.',
    'Public waterfront, public trust. Print the flyer and talk to a neighbour.',
    'Would you trade public lakefront for a private spa? Most Ontarians say no.',
  ],
  'ring-of-fire': [
    'Major mining roads need free, prior, and informed consent—not a rush past community objections.',
    'Billions in public infrastructure for northern mining—ask who decided and who pays.',
    'Indigenous rights are not optional. Hold the process accountable.',
  ],
  foi: [
    'Rolling back freedom-of-information access makes closed-door deals easier. Demand public records.',
    'When FOI fees go up and deadlines slip, accountability disappears. Ask your MPP why.',
    'Show the records—not spin. Share the FOI flyer with someone who cares about transparency.',
  ],
  'bike-lanes': [
    'Street safety policy should follow evidence—not get overridden for politics. Bike lanes save lives.',
    'Protected bike lanes reduce serious injuries. Tell your councillor to stop overriding safety policy.',
    'Safer streets are a public good. Share if your city deserves evidence-based policy.',
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
