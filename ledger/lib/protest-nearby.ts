import type { Protest } from './protests'
import { getCityFromLocation } from './protests'
import { getCityCoordinates, type LatLng } from './protest-city-coordinates'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const GEO_CACHE_PREFIX = 'protectont-geocode-'

/** Canadian postal code or US ZIP (5 digits). */
export function normalizePostalInput(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '')
}

export function isValidPostalInput(normalized: string): boolean {
  if (!normalized) return false
  if (/^\d{5}(-\d{4})?$/.test(normalized)) return true
  return /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(normalized)
}

/** Format Canadian postal for display: A1A 1A1 */
export function formatCanadianPostal(normalized: string): string {
  if (/^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(normalized)) {
    return `${normalized.slice(0, 3)} ${normalized.slice(3)}`
  }
  return normalized
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

function readGeoCache(key: string): LatLng | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(GEO_CACHE_PREFIX + key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LatLng
    if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') return parsed
  } catch {
    /* ignore */
  }
  return null
}

function writeGeoCache(key: string, coords: LatLng): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(GEO_CACHE_PREFIX + key, JSON.stringify(coords))
  } catch {
    /* ignore */
  }
}

/** Geocode postal / ZIP via OpenStreetMap Nominatim (client-side, cached per session). */
export async function geocodePostalCode(normalized: string): Promise<LatLng | null> {
  const cached = readGeoCache(normalized)
  if (cached) return cached

  const isUsZip = /^\d{5}/.test(normalized)
  const params = new URLSearchParams({
    format: 'json',
    limit: '1',
    countrycodes: isUsZip ? 'us' : 'ca',
  })
  if (isUsZip) {
    params.set('postalcode', normalized.slice(0, 5))
  } else {
    params.set('postalcode', formatCanadianPostal(normalized))
  }

  const res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) return null

  const data = (await res.json()) as { lat?: string; lon?: string }[]
  const hit = data[0]
  if (!hit?.lat || !hit?.lon) return null

  const coords = { lat: parseFloat(hit.lat), lng: parseFloat(hit.lon) }
  if (Number.isNaN(coords.lat) || Number.isNaN(coords.lng)) return null

  writeGeoCache(normalized, coords)
  return coords
}

export type ProtestWithDistance = {
  protest: Protest
  distanceKm: number
  city: string
}

export function rankProtestsByDistance(
  user: LatLng,
  protests: Protest[],
  options: { campaignId?: string; limit?: number } = {}
): ProtestWithDistance[] {
  const { campaignId, limit = 3 } = options
  const pool = campaignId
    ? protests.filter((p) => p.campaignId === campaignId && p.status !== 'cancelled')
    : protests.filter((p) => p.status !== 'cancelled')

  const ranked: ProtestWithDistance[] = []

  for (const protest of pool) {
    const coords = getCityCoordinates(protest.location)
    if (!coords) continue
    const city = getCityFromLocation(protest.location)
    ranked.push({
      protest,
      distanceKm: haversineKm(user, coords),
      city,
    })
  }

  ranked.sort((a, b) => a.distanceKm - b.distanceKm)
  return ranked.slice(0, limit)
}

export function formatDistanceKm(km: number): string {
  if (km < 1) return 'less than 1 km away'
  if (km < 15) return `about ${Math.round(km)} km away`
  return `about ${Math.round(km)} km away`
}
