export type FlyerSection = {
  title: string
  /** Optional paragraph before bullet list */
  lead?: string
  bullets: string[]
}

export type FlyerCta = {
  label: string
  text: string
}

export type FlyerShared = {
  headerEyebrow: string
  footerHeading: string
  footerFinePrint: string
  ctas: FlyerCta[]
}

export type Flyer = {
  id: string
  slug: string
  title: string
  subtitle: string
  intro: string
  /** Path under /public or absolute URL */
  heroImageUrl: string
  /** Short stat lines shown prominently under the intro (2–4 items) */
  highlights: string[]
  sections: FlyerSection[]
  calloutTitle: string
  calloutBody: string
  /** Optional action chips (label + URL) shown in a grid under the callout */
  calloutActions?: FlyerCta[]
  published: boolean
}

export type FlyersFile = {
  lastUpdated: string
  shared: FlyerShared
  flyers: Flyer[]
}

import { defaultFlyerEntries } from './flyers-default-content'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function parseBullets(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.map((b) => String(b).trim()).filter(Boolean)
}

function parseSections(raw: unknown): FlyerSection[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((s) => {
      if (!s || typeof s !== 'object') return null
      const o = s as Record<string, unknown>
      const title = String(o.title ?? '').trim()
      const lead = String(o.lead ?? '').trim()
      const bullets = parseBullets(o.bullets)
      if (!title && bullets.length === 0 && !lead) return null
      return { title, ...(lead ? { lead } : {}), bullets }
    })
    .filter((s): s is FlyerSection => s !== null)
}

function parseCtas(raw: unknown): FlyerCta[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((c) => {
      if (!c || typeof c !== 'object') return null
      const o = c as Record<string, unknown>
      const label = String(o.label ?? '').trim()
      const text = String(o.text ?? '').trim()
      if (!label && !text) return null
      return { label, text }
    })
    .filter((c): c is FlyerCta => c !== null)
}

function parseFlyer(raw: unknown): Flyer | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const slug = String(o.slug ?? o.id ?? '').trim()
  if (!slug) return null
  return {
    id: String(o.id ?? slug).trim(),
    slug,
    title: String(o.title ?? '').trim(),
    subtitle: String(o.subtitle ?? '').trim(),
    intro: String(o.intro ?? '').trim(),
    heroImageUrl: String(o.heroImageUrl ?? '').trim(),
    highlights: parseBullets(o.highlights),
    sections: parseSections(o.sections),
    calloutTitle: String(o.calloutTitle ?? '').trim(),
    calloutBody: String(o.calloutBody ?? '').trim(),
    calloutActions: parseCtas(o.calloutActions),
    published: o.published !== false,
  }
}

export function defaultFlyersFile(): FlyersFile {
  const shared: FlyerShared = {
    headerEyebrow: 'Public data · Ontario · Printable flyer',
    footerHeading: 'Take the next step',
    footerFinePrint:
      'Sources: Ontario Public Accounts, Auditor General reports, legislation, and documented journalism. See protectont.ca/methodology · Post freely · Print letter-size for community boards, doors & events',
    ctas: [
      { label: 'Learn', text: 'protectont.ca' },
      { label: 'Join', text: 'protectont.ca/join' },
      { label: 'Protest', text: 'protectont.ca/protests' },
    ],
  }

  return { lastUpdated: todayIso(), shared, flyers: defaultFlyerEntries }
}

export function parseFlyersFile(raw: unknown): FlyersFile {
  const defaults = defaultFlyersFile()
  if (!raw || typeof raw !== 'object') return defaults
  const o = raw as Record<string, unknown>

  const sharedRaw = o.shared
  let shared = defaults.shared
  if (sharedRaw && typeof sharedRaw === 'object') {
    const s = sharedRaw as Record<string, unknown>
    const ctas = parseCtas(s.ctas)
    shared = {
      headerEyebrow: String(s.headerEyebrow ?? defaults.shared.headerEyebrow).trim(),
      footerHeading: String(s.footerHeading ?? defaults.shared.footerHeading).trim(),
      footerFinePrint: String(s.footerFinePrint ?? defaults.shared.footerFinePrint).trim(),
      ctas: ctas.length > 0 ? ctas : defaults.shared.ctas,
    }
  }

  const flyersRaw = o.flyers
  let flyers = defaults.flyers
  if (Array.isArray(flyersRaw) && flyersRaw.length > 0) {
    const parsed = flyersRaw.map(parseFlyer).filter((f): f is Flyer => f !== null)
    if (parsed.length > 0) flyers = parsed
  }

  return {
    lastUpdated: String(o.lastUpdated ?? todayIso()).trim(),
    shared,
    flyers,
  }
}

export function serializeFlyersFile(file: FlyersFile): string {
  return JSON.stringify(
    {
      ...file,
      lastUpdated: todayIso(),
    },
    null,
    2
  )
}

export function getPublishedFlyers(file: FlyersFile): Flyer[] {
  return file.flyers.filter((f) => f.published)
}

export function getFlyerBySlug(file: FlyersFile, slug: string): Flyer | undefined {
  return file.flyers.find((f) => f.slug === slug && f.published)
}
