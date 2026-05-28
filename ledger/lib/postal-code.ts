/**
 * Normalize Canadian postal codes and US ZIPs for lookup and storage.
 * Accepts mixed case, spaces, hyphens, dots, and extra whitespace from paste.
 */

export type PostalKind = 'ca' | 'us' | 'unknown'

export type NormalizedPostal = {
  /** Canonical form for geocoding / cache keys (CA: A1A1A1, US: 5 or 9 digits) */
  value: string
  kind: PostalKind
}

/** Letter-digit alternation after separators removed (e.g. N2A0C1). */
const CA_POSTAL_RE = /^[A-Z]\d[A-Z]\d[A-Z]\d$/

/** Strip zero-width / BOM characters sometimes pasted from Word or PDFs. */
function stripInvisible(s: string): string {
  return s.replace(/[\u200B-\u200D\uFEFF]/g, '')
}

/**
 * Parse and normalize user input.
 * Examples: "n2a 0c1", "N2A-0C1", "N2A0C1", "  m5h2n2  ", "90210", "90210-1234"
 */
export function normalizePostalCode(raw: string): NormalizedPostal {
  const trimmed = stripInvisible(raw).trim()
  if (!trimmed) return { value: '', kind: 'unknown' }

  const lettersOnly = trimmed.replace(/[^A-Za-z]/g, '')
  const digitsOnly = trimmed.replace(/\D/g, '')

  // US ZIP / ZIP+4 — only when input has no letters (avoids conflating with Canadian)
  if (lettersOnly.length === 0 && /^\d{5}(\d{4})?$/.test(digitsOnly)) {
    return { value: digitsOnly, kind: 'us' }
  }

  // Canadian — remove all separators, uppercase
  const compact = trimmed.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (compact.length === 6 && CA_POSTAL_RE.test(compact)) {
    return { value: compact, kind: 'ca' }
  }

  return { value: compact, kind: 'unknown' }
}

export function isValidPostalCode(input: string | NormalizedPostal): boolean {
  const parsed = typeof input === 'string' ? normalizePostalCode(input) : input
  return parsed.kind === 'ca' || parsed.kind === 'us'
}

/** Human-friendly display (CA: "A1A 1A1", US ZIP+4: "12345-6789"). */
export function formatPostalCodeDisplay(parsed: NormalizedPostal): string {
  const { value, kind } = parsed
  if (kind === 'ca' && value.length === 6) {
    return `${value.slice(0, 3)} ${value.slice(3)}`
  }
  if (kind === 'us' && value.length === 9) {
    return `${value.slice(0, 5)}-${value.slice(5)}`
  }
  if (kind === 'us' && value.length === 5) {
    return value
  }
  return value
}

/** @deprecated Use normalizePostalCode — kept for existing imports */
export function normalizePostalInput(raw: string): string {
  return normalizePostalCode(raw).value
}

/** @deprecated Use isValidPostalCode */
export function isValidPostalInput(normalized: string): boolean {
  return isValidPostalCode(normalized)
}

/** @deprecated Use formatPostalCodeDisplay after normalizePostalCode */
export function formatCanadianPostal(normalized: string): string {
  const parsed = normalizePostalCode(normalized)
  if (parsed.kind === 'ca') return formatPostalCodeDisplay(parsed)
  return normalized
}
