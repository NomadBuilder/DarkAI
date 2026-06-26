import {
  SOCIAL_POST_HASHTAGS,
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
  const bodySource = postTextWithoutHashtag(idea.graphicText ?? idea.caption)
  const issueLabel = ISSUE_LABELS[idea.issue]
  const template = templateForFormat(idea.format)

  let headline = idea.headline?.trim() ?? ''
  if (!headline) {
    headline =
      template === 'quote'
        ? issueLabel.toUpperCase()
        : firstSentence(bodySource, 64).toUpperCase()
  }

  let body = bodySource

  return {
    issueLabel,
    headline,
    body,
    hashtag: idea.ctaPrimary?.trim() || SOCIAL_POST_HASHTAGS,
    site: idea.ctaSecondary?.trim() || 'protectont.ca',
    template,
  }
}
