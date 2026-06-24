import { flyerPublicUrl } from '@/lib/flyer-routes'

export function flyerPdfPath(slug: string): string {
  return `/downloads/flyers/${slug}.pdf`
}

export function flyerPdfFilename(slug: string): string {
  return `protectont-${slug}.pdf`
}

export function facebookShareUrl(pageUrl: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`
}

export { flyerPublicUrl }
