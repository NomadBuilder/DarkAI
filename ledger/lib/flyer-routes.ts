/** Canonical URL paths for printable flyers (index + per-slug pages). */
export const FLYERS_INDEX_PATH = '/flyers'

export function flyerPath(slug?: string): string {
  if (!slug) return FLYERS_INDEX_PATH
  return `${FLYERS_INDEX_PATH}/${slug}`
}

export const FLYERS_PUBLIC_ORIGIN = 'https://protectont.ca'

export function flyerPublicUrl(slug: string): string {
  return `${FLYERS_PUBLIC_ORIGIN}${flyerPath(slug)}`
}

export function flyerPublicIndexUrl(): string {
  return `${FLYERS_PUBLIC_ORIGIN}${FLYERS_INDEX_PATH}`
}
