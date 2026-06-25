import { getSocialGraphicContent, SOCIAL_GRAPHIC_EXPORT_SIZE, type SocialGraphicContent } from './social-graphic-content'
import type { SocialPostIdea } from './social-post-ideas'

const COLORS = {
  navyDark: '#152a45',
  navy: '#2E4A6B',
  navyDeep: '#1e3a5f',
  yellow: '#f9e04c',
  white: '#ffffff',
  ink: '#1a1a1a',
} as const

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  align: CanvasTextAlign = 'center'
): number {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return 0

  const lines: string[] = []
  let line = ''

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = testLine
    }
  }
  if (line) lines.push(line)

  ctx.textAlign = align
  ctx.textBaseline = 'top'
  lines.forEach((ln, idx) => {
    ctx.fillText(ln, x, y + idx * lineHeight)
  })
  return lines.length
}

function paintGradientBackground(ctx: CanvasRenderingContext2D, size: number) {
  const gradient = ctx.createLinearGradient(0, 0, size * 0.35, size)
  gradient.addColorStop(0, COLORS.navyDark)
  gradient.addColorStop(0.55, COLORS.navy)
  gradient.addColorStop(1, COLORS.navyDeep)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  ctx.fillStyle = 'rgba(249, 224, 76, 0.08)'
  ctx.beginPath()
  ctx.arc(size * 0.85, size * 0.12, size * 0.28, 0, Math.PI * 2)
  ctx.fill()
}

function paintBackgroundImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  size: number,
  opacity: number
) {
  const scale = Math.max(size / img.naturalWidth, size / img.naturalHeight)
  const w = img.naturalWidth * scale
  const h = img.naturalHeight * scale
  const x = (size - w) / 2
  const y = (size - h) / 2
  ctx.save()
  ctx.globalAlpha = opacity
  ctx.drawImage(img, x, y, w, h)
  ctx.restore()

  ctx.fillStyle = 'rgba(21, 42, 69, 0.72)'
  ctx.fillRect(0, 0, size, size)
}

function paintSocialGraphicContent(
  ctx: CanvasRenderingContext2D,
  content: SocialGraphicContent,
  size: number
) {
  const pad = Math.round(size * 0.1)
  const innerW = size - pad * 2
  const footerH = Math.round(size * 0.11)

  const issueSize = Math.round(size * 0.028)
  ctx.font = `600 ${issueSize}px Inter, system-ui, sans-serif`
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(content.issueLabel.toUpperCase(), size / 2, pad)

  const headlineSize =
    content.template === 'meme'
      ? Math.round(size * 0.078)
      : content.template === 'quote'
        ? Math.round(size * 0.04)
        : Math.round(size * 0.062)

  const bodySize =
    content.template === 'quote'
      ? Math.round(size * 0.042)
      : content.template === 'meme'
        ? Math.round(size * 0.034)
        : Math.round(size * 0.036)

  const headlineY = pad + Math.round(size * 0.06)
  ctx.font = `800 ${headlineSize}px "Arial Black", Inter, system-ui, sans-serif`
  ctx.fillStyle = COLORS.yellow
  const headlineLines = drawWrappedText(
    ctx,
    content.headline,
    size / 2,
    headlineY,
    innerW,
    Math.round(headlineSize * 1.08)
  )

  const bodyY =
    headlineY +
    headlineLines * Math.round(headlineSize * 1.08) +
    (content.template === 'quote' ? Math.round(size * 0.04) : Math.round(size * 0.035))

  ctx.font =
    content.template === 'quote'
      ? `500 ${bodySize}px Georgia, "Times New Roman", serif`
      : `400 ${bodySize}px Inter, system-ui, sans-serif`
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'

  let bodyText = content.body
  if (content.template === 'quote' && bodyText.length > 0) {
    bodyText = `"${bodyText}"`
  }

  drawWrappedText(ctx, bodyText, size / 2, bodyY, innerW, Math.round(bodySize * 1.35))

  ctx.fillStyle = COLORS.yellow
  ctx.fillRect(0, size - footerH, size, footerH)

  const tagSize = Math.round(size * 0.038)
  ctx.font = `800 ${tagSize}px "Arial Black", Inter, system-ui, sans-serif`
  ctx.fillStyle = COLORS.ink
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(content.hashtag, size / 2, size - footerH / 2 - Math.round(tagSize * 0.35))

  const siteSize = Math.round(size * 0.024)
  ctx.font = `500 ${siteSize}px Inter, system-ui, sans-serif`
  ctx.fillStyle = 'rgba(26, 26, 26, 0.75)'
  ctx.fillText(content.site, size / 2, size - footerH / 2 + Math.round(tagSize * 0.55))
}

export function paintSocialGraphic(
  canvas: HTMLCanvasElement,
  idea: SocialPostIdea,
  backgroundImage?: HTMLImageElement | null
) {
  const size = SOCIAL_GRAPHIC_EXPORT_SIZE
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const content = getSocialGraphicContent(idea)

  if (backgroundImage?.naturalWidth) {
    paintBackgroundImage(ctx, backgroundImage, size, 0.45)
  } else {
    paintGradientBackground(ctx, size)
  }

  paintSocialGraphicContent(ctx, content, size)
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

export async function renderSocialGraphicDataUrl(idea: SocialPostIdea): Promise<string> {
  const canvas = document.createElement('canvas')
  let bg: HTMLImageElement | null = null
  const url = idea.imageUrl?.trim()
  if (url && (url.startsWith('data:') || url.startsWith('http'))) {
    bg = await loadImage(url)
  }
  paintSocialGraphic(canvas, idea, bg)
  return canvas.toDataURL('image/png')
}

export function downloadSocialGraphic(idea: SocialPostIdea, dataUrl: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `fightford-${idea.id}.png`
  a.click()
}
