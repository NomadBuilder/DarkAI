export type FlyerSection = {
  title: string
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
  sections: FlyerSection[]
  calloutTitle: string
  calloutBody: string
  published: boolean
}

export type FlyersFile = {
  lastUpdated: string
  shared: FlyerShared
  flyers: Flyer[]
}

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
      const bullets = parseBullets(o.bullets)
      if (!title && bullets.length === 0) return null
      return { title, bullets }
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
    sections: parseSections(o.sections),
    calloutTitle: String(o.calloutTitle ?? '').trim(),
    calloutBody: String(o.calloutBody ?? '').trim(),
    published: o.published !== false,
  }
}

export function defaultFlyersFile(): FlyersFile {
  const shared: FlyerShared = {
    headerEyebrow: 'Public data · Ontario',
    footerHeading: 'Take the next step',
    footerFinePrint:
      'Sources: Ontario Public Accounts, Auditor General reports, legislation, and documented journalism. See protectont.ca/methodology · Post freely · Print for community boards & doorsteps',
    ctas: [
      { label: 'Learn', text: 'protectont.ca' },
      { label: 'Join', text: 'protectont.ca/join' },
      { label: 'Protest', text: 'protectont.ca/protests' },
    ],
  }

  const flyers: Flyer[] = [
    {
      id: 'overview',
      slug: 'overview',
      title: "Doug Ford's Ontario:",
      subtitle: "What's being sold off?",
      intro:
        'Cuts, privatization, and weakened accountability — the pattern is in the public record. Protect Ontario makes it visible so neighbours can talk about what\'s actually happening.',
      heroImageUrl: '',
      sections: [
        {
          title: 'Healthcare',
          bullets: [
            'Billions to private staffing agencies while public hospitals run deficits.',
            'For-profit clinics paid more than public hospitals for the same procedures.',
            'Longer waits as capacity shifts out of public hands.',
          ],
        },
        {
          title: 'Water',
          bullets: [
            'Bill 60 opens the door to corporate control of water and wastewater.',
            'Municipal oversight and public accountability are weakened.',
          ],
        },
        {
          title: 'Public land',
          bullets: [
            'Greenbelt swaps and Ontario Place — who benefits when protected land is opened up?',
            'Waterfront and farmland treated as developer opportunity, not public trust.',
          ],
        },
        {
          title: 'Environment & rights',
          bullets: [
            'Bill 5 rolls back species protection and Indigenous participation.',
            'Special economic zones and weakened environmental rules.',
          ],
        },
      ],
      calloutTitle: 'The bigger picture',
      calloutBody:
        'Public money is shifting toward private, for-profit delivery — in healthcare, water, land, and environmental rules. The details are buried in spreadsheets and legalese. ProtectOnt.ca uses only public sources to show the pattern so you can hold power to account.',
      published: true,
    },
    {
      id: 'healthcare',
      slug: 'healthcare',
      title: 'Healthcare under Ford:',
      subtitle: 'Public care, private profit',
      intro:
        'Ontario\'s public healthcare system is being hollowed out while private staffing agencies and for-profit clinics take publicly funded capacity.',
      heroImageUrl: '',
      sections: [
        {
          title: 'What the data shows',
          bullets: [
            'Private staffing agency spending has surged while hospitals face deficits and staffing shortages.',
            'For-profit clinics can be paid more per procedure than public hospitals for the same work.',
            'Bill 124 capped public-sector wages while agency costs climbed.',
            'Long-term care bed allocations have favoured for-profit operators.',
            'Emergency wait times and hallway medicine persist as capacity is stretched thin.',
          ],
        },
      ],
      calloutTitle: 'What you can do',
      calloutBody:
        'Talk to neighbours about keeping public dollars in public care. Find a protest at protectont.ca/protests or join organizers at protectont.ca/join.',
      published: true,
    },
    {
      id: 'water',
      slug: 'water',
      title: 'Water & wastewater:',
      subtitle: 'Who controls the tap?',
      intro:
        'Bill 60 and related policy changes open pathways toward corporate control of water and wastewater — with less municipal oversight.',
      heroImageUrl: '',
      sections: [
        {
          title: 'Key concerns',
          bullets: [
            'Municipal utilities face new pressures to partner with or sell to private operators.',
            'Ratepayers may lose transparency when decisions move behind corporate walls.',
            'Long-term costs often rise after privatization — the public still pays.',
            'Environmental safeguards and local accountability are harder to enforce.',
          ],
        },
      ],
      calloutTitle: 'Learn more',
      calloutBody:
        'See the full water analysis at protectont.ca/water — built from public legislation and documented reporting.',
      published: true,
    },
    {
      id: 'public-land',
      slug: 'public-land',
      title: 'Public land:',
      subtitle: 'Greenbelt, Ontario Place & who benefits',
      intro:
        'Protected land and public waterfront are being opened for development — often with little transparency about who gains.',
      heroImageUrl: '',
      sections: [
        {
          title: 'The pattern',
          bullets: [
            'Greenbelt land swaps removed protections while benefiting selected developers.',
            'Ontario Place privatization hands public waterfront to a spa resort operator.',
            'Farmland and watershed land face pressure from sprawl and infrastructure.',
            'Accountability gaps make it hard for communities to challenge backroom deals.',
          ],
        },
      ],
      calloutTitle: 'See the receipts',
      calloutBody:
        'Explore timelines and sources at protectont.ca/public-land and protectont.ca/receipts.',
      published: true,
    },
    {
      id: 'wildlife',
      slug: 'wildlife',
      title: 'Wildlife & species:',
      subtitle: 'Bill 5 and weakened protection',
      intro:
        'Bill 5 and related changes roll back species protection and public participation in environmental decisions.',
      heroImageUrl: '',
      sections: [
        {
          title: 'At stake',
          bullets: [
            'Species-at-risk rules weakened — more development, less habitat protection.',
            'Special economic zones can bypass normal environmental review.',
            'Public participation in environmental decisions is curtailed.',
            'Biodiversity loss has long-term costs communities will bear.',
          ],
        },
      ],
      calloutTitle: 'Take action',
      calloutBody:
        'Petitions and MPP contact tools at protectont.ca/take-action · Full context at protectont.ca/wildlife',
      published: true,
    },
    {
      id: 'indigenous-rights',
      slug: 'indigenous-rights',
      title: 'Indigenous rights:',
      subtitle: 'Consent, treaties & the Ring of Fire',
      intro:
        'Development pushes forward without free, prior, and informed consent — treaty obligations and Indigenous rights are sidelined.',
      heroImageUrl: '',
      sections: [
        {
          title: 'Why it matters',
          bullets: [
            'Bill 5 weakens Indigenous participation in environmental decisions.',
            'Ring of Fire and northern development proceed without adequate consent processes.',
            'Treaty rights and UNDRIP commitments are treated as obstacles, not foundations.',
            'Communities bear environmental risk while benefits flow elsewhere.',
          ],
        },
      ],
      calloutTitle: 'Learn & organize',
      calloutBody:
        'Read more at protectont.ca/indigenous-rights · Join community efforts at protectont.ca/join',
      published: true,
    },
    {
      id: 'accountability',
      slug: 'accountability',
      title: 'Accountability:',
      subtitle: 'Follow the public money',
      intro:
        'When spending shifts to private hands, transparency fades. Protect Ontario uses public accounts and documented sources to make the pattern visible.',
      heroImageUrl: '',
      sections: [
        {
          title: 'What we track',
          bullets: [
            'Ontario Public Accounts — where provincial dollars actually go.',
            'Private staffing agency invoices vs public hospital budgets.',
            'Legislation that opens public assets to for-profit delivery.',
            'Auditor General and journalism that surfaces conflicts of interest.',
          ],
        },
      ],
      calloutTitle: 'Explore the data',
      calloutBody:
        'Interactive timelines and spending visualizations at protectont.ca — methodology at protectont.ca/methodology',
      published: true,
    },
  ]

  return { lastUpdated: todayIso(), shared, flyers }
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
