import {
  formatPostalCodeDisplay,
  normalizePostalCode,
} from './postal-code'

const REPRESENT_BASE = 'https://represent.opennorth.ca'

export const FEATURED_BILL_ORDER = [
  'Bill 5',
  'Bill 17',
  'Bill 24',
  'Bill 60',
  'Bill 68',
  'Bill 97',
] as const

export type FeaturedBillId = (typeof FEATURED_BILL_ORDER)[number]

export type FeaturedBillMeta = {
  id: FeaturedBillId | string
  short: string
  title: string
}

export type FeaturedMpp = {
  name: string
  party: string
  riding: string
  email: string
  profileUrl: string
  votes: Record<string, string>
}

export type FeaturedVotesDataset = {
  asOf: string | null
  source: string
  bills: FeaturedBillMeta[]
  mpps: FeaturedMpp[]
}

export type PostalMppLookupOk = {
  ok: true
  mpp: FeaturedMpp
  riding: string
  postal: string
  city: string | null
  warning: string | null
}

export type PostalMppLookupErr = {
  ok: false
  error: string
}

export type PostalMppLookupResult = PostalMppLookupOk | PostalMppLookupErr

let cachedDataset: FeaturedVotesDataset | null = null

export async function loadFeaturedVotesDataset(): Promise<FeaturedVotesDataset> {
  if (cachedDataset) return cachedDataset
  const res = await fetch('/data/mpp-featured-votes.json')
  if (!res.ok) {
    throw new Error('Could not load MPP vote data.')
  }
  const data = (await res.json()) as FeaturedVotesDataset
  cachedDataset = data
  return data
}

function normalizeRiding(name: string): string {
  return String(name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[—–−‑]/g, '-')
    .replace(/[''`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizePersonName(name: string): string {
  return String(name || '')
    .toLowerCase()
    .replace(/^(hon\.|dr\.)\s*/i, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function findMppForDistrict(
  mpps: FeaturedMpp[],
  districtName: string | null | undefined,
  apiName: string | null | undefined
): FeaturedMpp | null {
  const wantRiding = normalizeRiding(districtName || '')
  if (wantRiding) {
    const byRiding = mpps.find((m) => normalizeRiding(m.riding) === wantRiding)
    if (byRiding) return byRiding
  }
  const wantName = normalizePersonName(apiName || '')
  if (wantName) {
    const byName = mpps.find((m) => normalizePersonName(m.name) === wantName)
    if (byName) return byName
  }
  return null
}

/** Look up Ontario MPP via OpenNorth Represent, then match to featured-vote dataset. */
export async function lookupFeaturedMppByPostal(
  postalCode: string,
  mpps: FeaturedMpp[]
): Promise<PostalMppLookupResult> {
  const parsed = normalizePostalCode(postalCode)
  if (parsed.kind !== 'ca') {
    return { ok: false, error: 'Enter a valid Ontario postal code (e.g. M5V 2T6).' }
  }

  const code = parsed.value
  const postal = formatPostalCodeDisplay(parsed)

  let data: {
    province?: string
    city?: string
    representatives_centroid?: Array<{
      elected_office?: string
      representative_set_name?: string
      district_name?: string
      name?: string
    }>
    boundaries_centroid?: Array<{
      boundary_set_name?: string
      name?: string
    }>
  }

  try {
    const res = await fetch(`${REPRESENT_BASE}/postcodes/${code}/`)
    if (res.status === 404) {
      return { ok: false, error: 'That postal code was not found. Double-check it and try again.' }
    }
    if (!res.ok) {
      return { ok: false, error: 'Lookup service is unavailable right now. Try again in a moment.' }
    }
    data = await res.json()
  } catch {
    return {
      ok: false,
      error: 'Could not reach the lookup service. Check your connection and try again.',
    }
  }

  if (data.province && data.province !== 'ON') {
    return {
      ok: false,
      error: `That postal code is in ${data.province || 'another province'}, not Ontario.`,
    }
  }

  const ontarioMpps = (data.representatives_centroid || []).filter(
    (r) =>
      r.elected_office === 'MPP' && (r.representative_set_name || '').includes('Ontario')
  )

  for (const rep of ontarioMpps) {
    const mpp = findMppForDistrict(mpps, rep.district_name, rep.name)
    if (mpp) {
      return {
        ok: true,
        mpp,
        riding: mpp.riding || rep.district_name || '',
        postal,
        city: data.city || null,
        warning: null,
      }
    }
  }

  const districts: string[] = []
  for (const b of data.boundaries_centroid || []) {
    if ((b.boundary_set_name || '').includes('Ontario electoral')) {
      const name = b.name
      if (name && !districts.includes(name)) districts.push(name)
    }
  }

  for (const district of districts) {
    const mpp = findMppForDistrict(mpps, district, null)
    if (mpp) {
      return {
        ok: true,
        mpp,
        riding: mpp.riding || district,
        postal,
        city: data.city || null,
        warning:
          districts.length > 1
            ? 'This postal code may touch more than one riding — we matched the best available result.'
            : null,
      }
    }
  }

  if (ontarioMpps.length || districts.length) {
    const label = ontarioMpps[0]?.district_name || districts[0]
    return {
      ok: false,
      error: `Found riding “${label}”, but it isn’t in our MPP list yet.`,
    }
  }

  return { ok: false, error: 'No Ontario MPP found for that postal code.' }
}

export function voteTone(vote: string): 'yes' | 'no' | 'noshow' | 'other' {
  const v = vote.trim().toLowerCase()
  if (v === 'yes') return 'yes'
  if (v === 'no') return 'no'
  if (v === 'no show' || v === 'absent') return 'noshow'
  return 'other'
}

/** One-line ask tailored to this MPP’s record on the six bills. */
export function oneLineAskForVotes(votes: Record<string, string>): string {
  const values = FEATURED_BILL_ORDER.map((id) => votes[id] || '')
  const yesCount = values.filter((v) => voteTone(v) === 'yes').length
  const noCount = values.filter((v) => voteTone(v) === 'no').length
  const noShowCount = values.filter((v) => voteTone(v) === 'noshow').length

  if (yesCount >= 4) {
    return 'Ask them why they voted Yes on bills sold as “protection” that strip species law, municipal power, and public water control.'
  }
  if (noCount >= 4) {
    return 'Thank them for voting No — ask them to keep pressing for repeal of Bill 5 and to block the next “Protect Ontario” package.'
  }
  if (noShowCount >= 3) {
    return 'Ask them why they skipped votes on bills that reshape public protections — and how they’ll show up next time.'
  }
  return 'Tell them you’ve seen their record on these six bills — and ask them to reverse course and protect public assets.'
}

export function formatVoteShareText(opts: {
  mpp: FeaturedMpp
  bills: FeaturedBillMeta[]
  postal: string
  ask: string
  pageUrl?: string
}): string {
  const { mpp, bills, postal, ask, pageUrl = 'https://protectont.ca/take-action#your-mpp-record' } =
    opts
  const lines = bills.map((b) => {
    const vote = mpp.votes[b.id] || '—'
    return `${b.id} (${b.short}): ${vote}`
  })
  return [
    `${mpp.name} (${mpp.riding}) — record on six “Protect Ontario” bills`,
    `Postal: ${postal}`,
    '',
    ...lines,
    '',
    ask,
    '',
    `Look up yours: ${pageUrl}`,
  ].join('\n')
}

export function mailtoForMppRecord(opts: {
  mpp: FeaturedMpp
  bills: FeaturedBillMeta[]
  ask: string
}): string {
  const { mpp, bills, ask } = opts
  const voteLines = bills
    .map((b) => `• ${b.id} (${b.short}): ${mpp.votes[b.id] || '—'}`)
    .join('\n')
  const body = `Hello ${mpp.name},

I looked up your voting record on the six featured “Protect Ontario” bills:

${voteLines}

${ask}

I am a constituent in ${mpp.riding} and I expect you to protect public assets, species law, and municipal democracy.

Sincerely,
[Your Name]`

  const subject = `Your record on Bills 5, 17, 24, 60, 68 & 97`
  if (mpp.email) {
    return `mailto:${encodeURIComponent(mpp.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
