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

export type SocialPostIdea = {
  id: string
  title: string
  issue: FordIssue
  format: PostFormat
  platforms: SocialPlatform[]
  caption: string
  visualBrief: string
  designTips: string
  /** Suggested on-image headline (large type) */
  headline?: string
}

export const FIGHT_FORD_HASHTAG = '#FightFord'

export const ISSUE_LABELS: Record<FordIssue, string> = {
  healthcare: 'Healthcare',
  education: 'Education',
  greenbelt: 'Greenbelt & environment',
  'public-land': 'Public land',
  water: 'Water',
  transparency: 'Transparency & receipts',
  accountability: 'Accountability',
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

function cap(text: string): string {
  const base = text.trim()
  if (base.includes(FIGHT_FORD_HASHTAG)) return base
  return `${base}\n\n${FIGHT_FORD_HASHTAG}`
}

export const SOCIAL_POST_IDEAS: SocialPostIdea[] = [
  {
    id: 'hc-wait-graphic',
    title: 'Wait times vs. private profit',
    issue: 'healthcare',
    format: 'graphic',
    platforms: ['instagram', 'facebook', 'threads'],
    headline: 'PUBLIC CARE. PUBLIC DOLLARS.',
    caption: cap(
      'Ontarians are waiting longer while more care shifts private. One clear graphic beats a rant—share the fact, tag your MPP, keep it local. protectont.ca'
    ),
    visualBrief:
      'Split screen: left = ER hallway or clock icon + “longer waits”; right = “$ flowing private” with simple arrows. Purple (#3d2b7a) background, yellow (#f9e04c) headline, orange accent (#ff9a3c).',
    designTips: 'Use one stat max. 1080×1080 or 4:5 for feed. Add small ProtectOnt.ca footer.',
  },
  {
    id: 'hc-meme-ER',
    title: 'Meme: “Still waiting…”',
    issue: 'healthcare',
    format: 'meme',
    platforms: ['facebook', 'instagram', 'x'],
    headline: 'STILL IN THE WAITING ROOM',
    caption: cap(
      'Meme format: relatable photo + bold top/bottom text about wait times. Funny but not cruel to patients—punch up at policy, not people in line.'
    ),
    visualBrief:
      'Classic meme layout (Impact font or bold sans). Bottom text: “Meanwhile Ontario expands private billing.” Keep text under 12 words total on image.',
    designTips: 'High contrast text with black stroke. Export PNG; avoid tiny type on mobile.',
  },
  {
    id: 'edu-carousel',
    title: 'Carousel: 3 classroom facts',
    issue: 'education',
    format: 'carousel',
    platforms: ['instagram', 'facebook'],
    headline: 'FUND CLASSROOMS',
    caption: cap(
      'Swipe carousel: 3 slides, one fact each (class size, supports, funding). Slide 4 = “Learn more” + link in bio. Great for shares in school groups.'
    ),
    visualBrief:
      'Slide 1 hook: “Students need support before crisis.” Slides 2–3: bullet facts with icons (book, heart, dollar). Slide 4 CTA on yellow bar.',
    designTips: 'Consistent template per slide. First slide must work alone in preview grid.',
  },
  {
    id: 'edu-gif-chalk',
    title: 'GIF: chalkboard erase → “cuts”',
    issue: 'education',
    format: 'gif',
    platforms: ['instagram', 'facebook', 'tiktok'],
    caption: cap(
      'Short loop: chalkboard text gets erased line by line (class sizes, EAs, libraries). 3–5 sec, no sound needed. Perfect for Stories repost.'
    ),
    visualBrief:
      'Animation: “Smaller classes” → erased → “More EAs” → erased → “Public $ in public schools” stays. Hand-drawn chalk style on green board.',
    designTips: 'Keep under 15MB for IG. End frame holds 1 sec with #FightFord.',
  },
  {
    id: 'gb-before-after',
    title: 'Greenbelt before / after',
    issue: 'greenbelt',
    format: 'graphic',
    platforms: ['instagram', 'facebook', 'threads', 'bluesky'],
    headline: 'PROTECTED LAND ≠ OPEN FOR SALE',
    caption: cap(
      'Side-by-side map or green field photo: “Protected” vs “Paved.” One sentence caption. Strong share potential with environmental groups.'
    ),
    visualBrief:
      'Left: green satellite-style crop or illustration labeled “Promised protection.” Right: grey development overlay “Opened up.” Red line divider.',
    designTips: 'If using maps, cite source in caption (not on image). 16:9 works on Facebook; 4:5 for IG.',
  },
  {
    id: 'gb-story-poll',
    title: 'Story poll: “Should farmland be paved?”',
    issue: 'greenbelt',
    format: 'story',
    platforms: ['instagram', 'facebook'],
    caption: cap(
      'Story sticker poll: YES / NO on farmland paving. Follow-up slide: “Most Ontarians want protection—hold leaders accountable.” Link sticker to protectont.ca/join'
    ),
    visualBrief:
      'Full-screen green gradient, bold question at top, poll sticker center, small Ford Failed You mark bottom corner.',
    designTips: 'Post poll 24h before linking to a static explainer graphic in next story.',
  },
  {
    id: 'land-quote-card',
    title: 'Quote card: public land',
    issue: 'public-land',
    format: 'graphic',
    platforms: ['instagram', 'facebook', 'x'],
    headline: 'PUBLIC LAND IS NOT A GIVEAWAY',
    caption: cap(
      'Simple quote on purple background—one line about public land staying public. Pair with a local example if you have one (park, wetland, trail).'
    ),
    visualBrief:
      'Large quote marks, 2–3 lines max, orange underline on key phrase. Optional small tree icon.',
    designTips: '1080×1350 portrait fills phone screen. Readable at thumbnail size.',
  },
  {
    id: 'water-stat-meme',
    title: 'Meme: water bill shock',
    issue: 'water',
    format: 'meme',
    platforms: ['facebook', 'instagram', 'tiktok'],
    headline: 'THAT BILL THO',
    caption: cap(
      'Relatable “when you open the water bill” reaction image + text about rising costs / weak safeguards. Tie to community, not individual shame.'
    ),
    visualBrief:
      'Reaction photo or cartoon faucet dripping money. Top: “Me reading my water bill.” Bottom: “Still waiting for real protection.”',
    designTips: 'TikTok: add 3-word on-screen text for mute scrollers.',
  },
  {
    id: 'trans-receipt-carousel',
    title: 'Carousel: “The receipts”',
    issue: 'transparency',
    format: 'carousel',
    platforms: ['instagram', 'facebook', 'threads'],
    headline: 'SHOW THE RECEIPTS',
    caption: cap(
      'Screenshot-style slides: “Decision → who benefited → what it cost us.” Link to protectont.ca/receipts in last slide. Credibility > outrage.'
    ),
    visualBrief:
      'Fake document aesthetic: stamp “PUBLIC RECORD,” highlight one line per slide. Yellow highlighter effect on key numbers.',
    designTips: 'Blur personal info if using real screenshots. Keep fonts consistent (mono + sans).',
  },
  {
    id: 'trans-gif-news',
    title: 'GIF: headline ticker',
    issue: 'transparency',
    format: 'gif',
    platforms: ['instagram', 'facebook', 'x'],
    caption: cap(
      'Scrolling ticker of short headlines (oversight, contracts, closed doors). Feels like “news” — easy to share on X and FB.'
    ),
    visualBrief:
      'Black bar, yellow text scrolling: “Who signed?” “Who paid?” “Who was in the room?” Loop seamlessly.',
    designTips: 'GIF 800×450 for X; also works as video MP4 for IG.',
  },
  {
    id: 'acct-yard-sign-photo',
    title: 'Photo post: yard sign in the wild',
    issue: 'accountability',
    format: 'graphic',
    platforms: ['instagram', 'facebook'],
    headline: 'FORD FAILED YOU',
    caption: cap(
      'Real photo of a yard sign on a lawn or balcony—authentic beats polished. Ask permission if it’s not your home. “Want one? Link in comments → protectont.ca/join”'
    ),
    visualBrief:
      'User-generated photo with minimal overlay: small yellow corner tag #FightFord. No heavy filter.',
    designTips: 'Square crop with sign centered. Tag location in caption (city) for local reach.',
  },
  {
    id: 'acct-reel-15s',
    title: 'Reel: 15-second “one issue”',
    issue: 'accountability',
    format: 'reel',
    platforms: ['instagram', 'tiktok', 'facebook'],
    caption: cap(
      '15 sec vertical: you on camera OR text-on-screen only. Structure: hook (3s) → one fact (7s) → CTA “Join / share” (5s).'
    ),
    visualBrief:
      'Text-on-screen version: purple background, yellow words popping per beat. Optional cap cut transitions.',
    designTips: 'Burn in captions. End with verbal or visual CTA + hashtag on last frame.',
  },
  {
    id: 'hc-fb-share-text',
    title: 'Facebook text + link',
    issue: 'healthcare',
    format: 'text',
    platforms: ['facebook'],
    caption: cap(
      'No image needed: 2 short paragraphs + question for comments (“What’s your wait time story?”) + link protectont.ca/healthcare. Groups love discussion prompts.'
    ),
    visualBrief: 'N/A — text only. Bold first line with emoji optional (🏥).',
    designTips: 'Post when group rules allow links; otherwise “link in first comment.”',
  },
  {
    id: 'edu-threads-hot-take',
    title: 'Threads: one-line hot take',
    issue: 'education',
    format: 'text',
    platforms: ['threads', 'bluesky', 'x'],
    caption: cap(
      'Single sentence under 280 chars: concrete, no pile-on. Example: “Public education isn’t failing—underfunding is the policy choice. #FightFord”'
    ),
    visualBrief: 'Optional: attach one stat graphic as reply thread.',
    designTips: 'Reply to your own post with source link—keeps main post clean.',
  },
  {
    id: 'gb-meme-drake',
    title: 'Meme template: Drake / choice',
    issue: 'greenbelt',
    format: 'meme',
    platforms: ['instagram', 'facebook', 'x'],
    headline: 'PROTECT / PAVE',
    caption: cap(
      'Drake-style two-panel: “Protect farmland & watersheds” (yes) vs “Pave the Greenbelt” (no). Instantly readable, high share rate.'
    ),
    visualBrief:
      'Standard Drake meme layout. Keep labels 4–6 words. Purple tint optional on reject panel.',
    designTips: 'Use licensed or common template; don’t stretch aspect ratio.',
  },
  {
    id: 'multi-issue-weekly',
    title: 'Weekly series: “Ford issue Monday”',
    issue: 'accountability',
    format: 'graphic',
    platforms: ['instagram', 'facebook', 'threads', 'bluesky'],
    headline: 'ISSUE OF THE WEEK',
    caption: cap(
      'Pick one issue per week—same frame, swap headline & icon. Followers learn your rhythm; easy for volunteers to replicate.'
    ),
    visualBrief:
      'Template: top band “MONDAY: HEALTHCARE” (swap issue), center icon, bottom “Share if you agree.” Save as Canva template.',
    designTips: 'Schedule 4 weeks ahead: healthcare → education → land → water.',
  },
]

export function buildShareableCaption(idea: SocialPostIdea): string {
  return idea.caption
}
