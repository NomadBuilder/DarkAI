const SITE_ORIGIN = 'https://protectont.ca'

export function flyerPublicUrl(slug: string): string {
  return `${SITE_ORIGIN}/flyer/${slug}`
}

export function flyerPdfPath(slug: string): string {
  return `/downloads/flyers/${slug}.pdf`
}

export function flyerPdfFilename(slug: string): string {
  return `protectont-${slug}.pdf`
}

export function facebookShareUrl(pageUrl: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`
}
