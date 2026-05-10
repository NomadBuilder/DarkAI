/**
 * When the Next dev server runs on a different port than Flask, set
 * NEXT_PUBLIC_FLASK_API_ORIGIN (e.g. http://127.0.0.1:5050) in .env.local.
 * In production, leave unset so /api/... is same-origin with protectont.ca.
 */
export function getApiBaseUrl(): string {
  if (typeof process === 'undefined') return ''
  return (process.env.NEXT_PUBLIC_FLASK_API_ORIGIN || '').replace(/\/$/, '')
}
