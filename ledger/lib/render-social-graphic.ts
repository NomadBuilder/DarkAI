import {
  getSocialGraphicContent,
  SOCIAL_GRAPHIC_EXPORT_SIZE,
  type SocialGraphicContent,
} from './social-graphic-content'
import { LOGO_MARK_URL, resolveGraphicLogoUrl, resolveGraphicStyle, type ResolvedGraphicStyle } from './social-graphic-style'
import type { SocialPostIdea } from './social-post-ideas'

const COLORS = {
  yellow: '#f9e04c',
  white: '#ffffff',
  ink: '#1a1a1a',
} as const

function countWrappedLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): number {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return 0

  let lines = 0
  let line = ''
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines++
      line = word
    } else {
      line = testLine
    }
  }
  if (line) lines++
  return lines
}

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

function paintGradientBackground(
  ctx: CanvasRenderingContext2D,
  size: number,
  style: ResolvedGraphicStyle
) {
  const gradient = ctx.createLinearGradient(0, 0, size * 0.35, size)
  gradient.addColorStop(0, style.backgroundColor)
  gradient.addColorStop(0.55, style.backgroundColorEnd)
  gradient.addColorStop(1, style.backgroundColor)
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
  opacity: number,
  overlayColor: string
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

  ctx.fillStyle = overlayColor
  ctx.fillRect(0, 0, size, size)
}

function paintLogo(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement,
  size: number
): number {
  const logoW = Math.round(size * 0.2)
  const aspect = logo.naturalHeight / logo.naturalWidth || 0.35
  const logoH = Math.round(logoW * aspect)
  const x = (size - logoW) / 2
  const y = Math.round(size * 0.035)
  ctx.drawImage(logo, x, y, logoW, logoH)
  return y + logoH
}

type TextLayout = {
  issueSize: number
  headlineSize: number
  bodySize: number
  headlineLineH: number
  bodyLineH: number
  issueLineH: number
  gapAfterIssue: number
  gapAfterHeadline: number
  issueLines: number
  headlineLines: number
  bodyLines: number
  blockHeight: number
}

function lineHeightForFont(ctx: CanvasRenderingContext2D, fontSize: number, multiplier: number): number {
  const metrics = ctx.measureText('Mgypq')
  const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.78
  const descent = metrics.actualBoundingBoxDescent || fontSize * 0.22
  return Math.ceil((ascent + descent) * multiplier)
}

function findFitScale(
  ctx: CanvasRenderingContext2D,
  content: SocialGraphicContent,
  bodyText: string,
  size: number,
  innerW: number,
  hasImage: boolean,
  availableH: number
): number {
  let lo = 0.5
  let hi = hasImage ? 1 : 0.92
  let best = lo

  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2
    const layout = measureTextLayout(ctx, content, bodyText, size, innerW, hasImage, mid)
    if (layout.blockHeight <= availableH) {
      best = mid
      lo = mid
    } else {
      hi = mid
    }
  }

  return best
}

function measureTextLayout(
  ctx: CanvasRenderingContext2D,
  content: SocialGraphicContent,
  bodyText: string,
  size: number,
  innerW: number,
  hasImage: boolean,
  fitScale: number
): TextLayout {
  const issueSize = Math.round(size * 0.028 * (hasImage ? 1 : 1.1) * fitScale)
  const headlineSize = Math.round(
    (content.template === 'meme'
      ? size * 0.078
      : content.template === 'quote'
        ? size * 0.04
        : size * 0.062) * fitScale
  )
  const bodySize = Math.round(
    (content.template === 'quote'
      ? size * 0.042
      : content.template === 'meme'
        ? size * 0.034
        : size * 0.036) * fitScale
  )

  const gapAfterIssue = Math.round(size * (hasImage ? 0.02 : 0.028) * fitScale)
  const gapAfterHeadline = Math.round(
    (content.template === 'quote' ? size * 0.04 : size * 0.032) * fitScale
  )

  ctx.font = `600 ${issueSize}px Inter, system-ui, sans-serif`
  const issueLineH = lineHeightForFont(ctx, issueSize, 1.2)
  const issueLines = countWrappedLines(ctx, content.issueLabel.toUpperCase(), innerW)

  ctx.font = `800 ${headlineSize}px "Arial Black", Inter, system-ui, sans-serif`
  const headlineLineH = lineHeightForFont(ctx, headlineSize, 1.1)
  const headlineLines = countWrappedLines(ctx, content.headline, innerW)

  ctx.font =
    content.template === 'quote'
      ? `500 ${bodySize}px Georgia, "Times New Roman", serif`
      : `400 ${bodySize}px Inter, system-ui, sans-serif`
  const bodyLineH = lineHeightForFont(ctx, bodySize, 1.22)
  const bodyLines = countWrappedLines(ctx, bodyText, innerW)

  const blockHeight =
    issueLines * issueLineH +
    gapAfterIssue +
    headlineLines * headlineLineH +
    gapAfterHeadline +
    bodyLines * bodyLineH +
    Math.round(size * 0.02)

  return {
    issueSize,
    headlineSize,
    bodySize,
    headlineLineH,
    bodyLineH,
    issueLineH,
    gapAfterIssue,
    gapAfterHeadline,
    issueLines,
    headlineLines,
    bodyLines,
    blockHeight,
  }
}

function paintSocialGraphicContent(
  ctx: CanvasRenderingContext2D,
  content: SocialGraphicContent,
  size: number,
  style: ResolvedGraphicStyle,
  hasImage: boolean,
  logoBottom: number
) {
  const pad = Math.round(size * 0.1)
  const innerW = size - pad * 2
  const footerH = Math.round(size * 0.11)
  const footerTop = size - footerH
  const contentTop = logoBottom + Math.round(size * 0.025)
  const contentBottom = footerTop - Math.round(size * 0.08)

  let bodyText = content.body
  if (content.template === 'quote' && bodyText.length > 0) {
    bodyText = `"${bodyText}"`
  }

  const availableH = contentBottom - contentTop
  const fitScale = findFitScale(ctx, content, bodyText, size, innerW, hasImage, availableH)
  const layout = measureTextLayout(ctx, content, bodyText, size, innerW, hasImage, fitScale)

  ctx.fillStyle = style.ctaBackground
  ctx.fillRect(0, footerTop, size, footerH)

  const {
    issueSize,
    headlineSize,
    bodySize,
    headlineLineH,
    bodyLineH,
    issueLineH,
    gapAfterIssue,
    gapAfterHeadline,
    issueLines,
    blockHeight,
  } = layout

  let blockY = contentTop
  if (!hasImage && blockHeight < availableH * 0.72) {
    blockY = contentTop + Math.round((availableH - blockHeight) / 2)
  }
  blockY = Math.max(contentTop, Math.min(blockY, contentBottom - blockHeight))

  ctx.font = `600 ${issueSize}px Inter, system-ui, sans-serif`
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
  drawWrappedText(
    ctx,
    content.issueLabel.toUpperCase(),
    size / 2,
    blockY,
    innerW,
    issueLineH
  )
  blockY += issueLines * issueLineH + gapAfterIssue

  ctx.font = `800 ${headlineSize}px "Arial Black", Inter, system-ui, sans-serif`
  ctx.fillStyle = COLORS.yellow
  const drawnHeadlineLines = drawWrappedText(
    ctx,
    content.headline,
    size / 2,
    blockY,
    innerW,
    headlineLineH
  )
  blockY += drawnHeadlineLines * headlineLineH + gapAfterHeadline

  ctx.font =
    content.template === 'quote'
      ? `500 ${bodySize}px Georgia, "Times New Roman", serif`
      : `400 ${bodySize}px Inter, system-ui, sans-serif`
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
  drawWrappedText(ctx, bodyText, size / 2, blockY, innerW, bodyLineH)

  const tagLine = style.ctaPrimary
  let tagSize = Math.round(size * 0.034)
  ctx.font = `800 ${tagSize}px "Arial Black", Inter, system-ui, sans-serif`
  while (ctx.measureText(tagLine).width > innerW * 0.94 && tagSize > Math.round(size * 0.026)) {
    tagSize -= 1
    ctx.font = `800 ${tagSize}px "Arial Black", Inter, system-ui, sans-serif`
  }
  ctx.fillStyle = COLORS.ink
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(tagLine, size / 2, size - footerH / 2 - Math.round(tagSize * 0.35))

  const siteSize = Math.round(size * 0.024)
  ctx.font = `500 ${siteSize}px Inter, system-ui, sans-serif`
  ctx.fillStyle = 'rgba(26, 26, 26, 0.75)'
  ctx.fillText(style.ctaSecondary, size / 2, size - footerH / 2 + Math.round(tagSize * 0.55))
}

export function paintSocialGraphic(
  canvas: HTMLCanvasElement,
  idea: SocialPostIdea,
  backgroundImage?: HTMLImageElement | null,
  logoImage?: HTMLImageElement | null
) {
  const size = SOCIAL_GRAPHIC_EXPORT_SIZE
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const style = resolveGraphicStyle(idea)
  const hasImage = Boolean(backgroundImage?.naturalWidth)
  const content = getSocialGraphicContent(idea)

  if (hasImage && backgroundImage) {
    paintBackgroundImage(
      ctx,
      backgroundImage,
      size,
      0.45,
      `${style.backgroundColor}bb`
    )
  } else {
    paintGradientBackground(ctx, size, style)
  }

  let logoBottom = Math.round(size * 0.04)
  if (logoImage?.naturalWidth) {
    logoBottom = paintLogo(ctx, logoImage, size)
  }

  paintSocialGraphicContent(ctx, content, size, style, hasImage, logoBottom)
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

const logoCache = new Map<string, Promise<HTMLImageElement | null>>()

function loadLogo(src: string): Promise<HTMLImageElement | null> {
  const cached = logoCache.get(src)
  if (cached) return cached

  const promise = loadImage(src).then((img) =>
    img ? img : src === LOGO_MARK_URL ? loadImage('/shield-icon.png') : null
  )
  logoCache.set(src, promise)
  return promise
}

export async function renderSocialGraphicDataUrl(idea: SocialPostIdea): Promise<string> {
  const canvas = document.createElement('canvas')
  let bg: HTMLImageElement | null = null
  const url = idea.imageUrl?.trim()
  if (url && (url.startsWith('data:') || url.startsWith('http'))) {
    bg = await loadImage(url)
  }
  const logo = await loadLogo(resolveGraphicLogoUrl(idea))
  paintSocialGraphic(canvas, idea, bg, logo)
  return canvas.toDataURL('image/png')
}

export function downloadSocialGraphic(idea: SocialPostIdea, dataUrl: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `fightford-${idea.id}.png`
  a.click()
}
