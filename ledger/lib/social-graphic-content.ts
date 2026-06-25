import {
  FIGHT_FORD_HASHTAG,
  ISSUE_LABELS,
  postTextWithoutHashtag,
  type PostFormat,
  type SocialPostIdea,
} from './social-post-ideas'

export const SOCIAL_GRAPHIC_EXPORT_SIZE = 1080

export type SocialGraphicContent = {
  issueLabel: string
  headline: string
  body: string
  hashtag: string
  site: string
  template: 'headline' | 'quote' | 'meme'
}

function truncateAtWord(text: string, maxLen: number): string {
  const t = text.trim()
  if (t.length <= maxLen) return t
  const slice = t.slice(0, maxLen)
  const lastSpace = slice.lastIndexOf(' ')
  const cut = lastSpace > maxLen * 0.5 ? slice.slice(0, lastSpace) : slice
  return `${cut.trim()}…`
}

function firstSentence(text: string, maxLen = 72): string {
  const match = text.match(/^[^.!?]+[.!?]?/)
  const sentence = (match?.[0] ?? text).trim()
  return truncateAtWord(sentence, maxLen)
}

function templateForFormat(format: PostFormat): SocialGraphicContent['template'] {
  if (format === 'meme') return 'meme'
  if (format === 'text') return 'quote'
  return 'headline'
}

/** Text fields used for preview + PNG export (separate from full paste caption). */
export function getSocialGraphicContent(idea: SocialPostIdea): SocialGraphicContent {
  const bodySource = postTextWithoutHashtag(idea.caption)
  const issueLabel = ISSUE_LABELS[idea.issue]
  const template = templateForFormat(idea.format)

  let headline = idea.headline?.trim() ?? ''
  if (!headline) {
    headline =
      template === 'quote'
        ? issueLabel.toUpperCase()
        : firstSentence(bodySource, 64).toUpperCase()
  }

  let body = ''
  if (template === 'quote') {
    body = truncateAtWord(bodySource, 200)
  } else if (template === 'meme') {
    body = truncateAtWord(bodySource, 120)
  } else {
    body = truncateAtWord(bodySource, 160)
  }

  return {
    issueLabel,
    headline,
    body,
    hashtag: FIGHT_FORD_HASHTAG,
    site: 'protectont.ca',
    template,
  }
}
