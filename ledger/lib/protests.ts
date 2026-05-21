/** Shared types and helpers for protests.json (public + admin). */

export type ProtestTopicId =
  | 'healthcare'
  | 'water'
  | 'land'
  | 'wildlife'
  | 'indigenous'
  | 'accountability'

export type ProtestStatus = 'confirmed' | 'cancelled' | 'postponed'

export interface Protest {
  id: string
  title: string
  date: string
  location: string
  description?: string
  link?: string
  topics?: ProtestTopicId[]
  organizer?: string
  address?: string
  campaignId?: string
  status?: ProtestStatus
  featured?: boolean
}

export interface FeaturedCampaign {
  enabled: boolean
  label: string
  href?: string
}

export interface ProtestsFile {
  lastUpdated?: string
  featuredCampaign?: FeaturedCampaign
  events: Protest[]
}

export const PROTEST_TOPICS: { id: ProtestTopicId; label: string }[] = [
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'water', label: 'Water' },
  { id: 'land', label: 'Public land' },
  { id: 'wildlife', label: 'Wildlife & Bill 5' },
  { id: 'indigenous', label: 'Indigenous rights' },
  { id: 'accountability', label: 'Accountability' },
]

export const PROTEST_STATUSES: { id: ProtestStatus; label: string }[] = [
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'postponed', label: 'Postponed' },
  { id: 'cancelled', label: 'Cancelled' },
]

/** Parse date strings like "May 30, 2026 · 2:00 PM" or "Feb 21, 2026". */
export function parseProtestDate(dateStr: string): Date | null {
  if (!dateStr) return null
  const [datePartRaw, timePartRaw] = dateStr.split('·').map((part) => part.trim())
  const datePart = datePartRaw || ''
  const timePart = timePartRaw || ''
  const dateMatch = datePart.match(/^([A-Za-z]{3,9})\s+(\d{1,2}),\s*(\d{4})$/)
  if (!dateMatch) return null
  const [, monthNameRaw, dayRaw, yearRaw] = dateMatch
  const monthName = monthNameRaw.toLowerCase()
  const monthMap: Record<string, number> = {
    jan: 0,
    january: 0,
    feb: 1,
    february: 1,
    mar: 2,
    march: 2,
    apr: 3,
    april: 3,
    may: 4,
    jun: 5,
    june: 5,
    jul: 6,
    july: 6,
    aug: 7,
    august: 7,
    sep: 8,
    sept: 8,
    september: 8,
    oct: 9,
    october: 9,
    nov: 10,
    november: 10,
    dec: 11,
    december: 11,
  }
  const monthIndex = monthMap[monthName]
  if (monthIndex === undefined) return null
  const timeMatch = timePart.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i)
  let hour = 12
  let minute = 0
  if (timeMatch) {
    const rawHour = parseInt(timeMatch[1], 10)
    const rawMinute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0
    const meridiem = timeMatch[3].toUpperCase()
    hour = rawHour % 12
    if (meridiem === 'PM') hour += 12
    minute = rawMinute
  }
  const year = parseInt(yearRaw, 10)
  const day = parseInt(dayRaw, 10)
  return new Date(year, monthIndex, day, hour, minute)
}

export function isValidProtestDate(dateStr: string): boolean {
  return parseProtestDate(dateStr) !== null
}

/** Accept legacy bare array or wrapped { events, ... }. */
export function parseProtestsFile(data: unknown): ProtestsFile {
  if (Array.isArray(data)) {
    return { events: data as Protest[] }
  }
  if (data && typeof data === 'object' && 'events' in data) {
    const file = data as ProtestsFile
    return {
      lastUpdated: file.lastUpdated,
      featuredCampaign: file.featuredCampaign,
      events: Array.isArray(file.events) ? file.events : [],
    }
  }
  return { events: [] }
}

export function serializeProtestsFile(file: ProtestsFile): string {
  return JSON.stringify(
    {
      lastUpdated: file.lastUpdated ?? new Date().toISOString().slice(0, 10),
      featuredCampaign: file.featuredCampaign,
      events: file.events,
    },
    null,
    2
  )
}

export function getCityFromLocation(location: string): string {
  if (!location) return ''
  const trimmed = location.trim()
  if (trimmed.toLowerCase().includes('province-wide')) return 'Province-wide'
  const beforeComma = trimmed.split(',')[0]?.trim() ?? trimmed
  return beforeComma
}

export function mapsUrlForEvent(event: Protest): string | null {
  const q = event.address?.trim() || event.location?.trim()
  if (!q) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
}

export function topicLabel(id: ProtestTopicId): string {
  return PROTEST_TOPICS.find((t) => t.id === id)?.label ?? id
}

export type ProtestValidation = {
  id: string
  title: string
  dateOk: boolean
  visible: boolean
}

export function validateEvents(events: Protest[]): ProtestValidation[] {
  return events.map((e) => {
    const dateOk = isValidProtestDate(e.date)
    const cancelled = e.status === 'cancelled'
    return {
      id: e.id,
      title: e.title,
      dateOk,
      visible: dateOk && !cancelled,
    }
  })
}
