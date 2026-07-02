export type IndigenousProvince =
  | 'BC'
  | 'AB'
  | 'SK'
  | 'MB'
  | 'ON'
  | 'QC'
  | 'NB'
  | 'NS'
  | 'PE'
  | 'NL'
  | 'YT'
  | 'NT'
  | 'NU'
  | 'National'

export type CampaignIssue =
  | 'mining'
  | 'logging'
  | 'pipelines'
  | 'conservation'
  | 'treaty-rights'
  | 'water'
  | 'land-back'
  | 'energy'
  | 'fisheries'
  | 'legal'

export type CampaignStatus =
  | 'active'
  | 'legal-challenge'
  | 'stewardship'
  | 'ongoing'
  | 'victory'

export type HubLink = {
  label: string
  href: string
  note?: string
}

export type HubTimelineEvent = {
  date: string
  title: string
  summary?: string
  sourceUrl?: string
  sourceLabel?: string
}

export type IndigenousCampaign = {
  slug: string
  title: string
  summary: string
  status: CampaignStatus
  issues: CampaignIssue[]
  provinces: IndigenousProvince[]
  nations: string[]
  lat: number
  lng: number
  mapLabel?: string
  whyItMatters: string
  background: string
  perspectives?: string
  statusDetail?: string
  timeline: HubTimelineEvent[]
  officialSite?: HubLink
  donate?: HubLink[]
  merch?: HubLink[]
  volunteer?: HubLink[]
  petitions?: HubLink[]
  social?: HubLink[]
  contact?: HubLink[]
  news?: HubLink[]
  resources?: HubLink[]
  relatedSlugs?: string[]
  imageCredit?: string
  lastVerified: string
}

export type IndigenousOrganization = {
  slug: string
  name: string
  mission: string
  regions: IndigenousProvince[]
  type: string
  website: HubLink
  donate?: HubLink[]
  social?: HubLink[]
  initiatives?: string[]
  relatedCampaignSlugs?: string[]
  lastVerified: string
}

export type LearningTopic = {
  slug: string
  title: string
  summary: string
  body: string[]
  keyPoints?: string[]
  resources: HubLink[]
  relatedSlugs?: string[]
}

export type NewsSource = {
  name: string
  description: string
  href: string
  type: 'indigenous-led' | 'journalism' | 'research'
}

export type HubEvent = {
  id: string
  title: string
  date: string
  endDate?: string
  location?: string
  type: 'rally' | 'webinar' | 'fundraiser' | 'court' | 'community' | 'volunteer'
  campaignSlug?: string
  href?: string
  sourceLabel?: string
  note?: string
}

export type IndigenousHubFile = {
  lastUpdated: string
  disclaimer: string
  campaigns: IndigenousCampaign[]
  organizations: IndigenousOrganization[]
  learningTopics: LearningTopic[]
  newsSources: NewsSource[]
  events: HubEvent[]
}

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  active: 'Active defence',
  'legal-challenge': 'Legal challenge',
  stewardship: 'Stewardship & Land Back',
  ongoing: 'Ongoing campaign',
  victory: 'Victory / precedent',
}

export const CAMPAIGN_ISSUE_LABELS: Record<CampaignIssue, string> = {
  mining: 'Mining',
  logging: 'Logging',
  pipelines: 'Pipelines & LNG',
  conservation: 'Conservation & IPCAs',
  'treaty-rights': 'Treaty rights',
  water: 'Water protection',
  'land-back': 'Land Back',
  energy: 'Energy & dams',
  fisheries: 'Fisheries',
  legal: 'Legal defence',
}

export const PROVINCE_LABELS: Record<IndigenousProvince, string> = {
  BC: 'British Columbia',
  AB: 'Alberta',
  SK: 'Saskatchewan',
  MB: 'Manitoba',
  ON: 'Ontario',
  QC: 'Quebec',
  NB: 'New Brunswick',
  NS: 'Nova Scotia',
  PE: 'Prince Edward Island',
  NL: 'Newfoundland & Labrador',
  YT: 'Yukon',
  NT: 'Northwest Territories',
  NU: 'Nunavut',
  National: 'National',
}

export const HUB_NAV: { href: string; label: string; exact?: boolean }[] = [
  { href: '/indigenous', label: 'Home', exact: true },
  { href: '/indigenous/campaigns', label: 'Campaigns' },
  { href: '/indigenous/map', label: 'Map' },
  { href: '/indigenous/organizations', label: 'Organizations' },
  { href: '/indigenous/learn', label: 'Learn' },
  { href: '/indigenous/news', label: 'News' },
  { href: '/indigenous/events', label: 'Events' },
  { href: '/indigenous/support', label: 'Support' },
]

export function parseIndigenousHubFile(data: unknown): IndigenousHubFile {
  const file = data as IndigenousHubFile
  const campaigns = (Array.isArray(file?.campaigns) ? file.campaigns : []).map((c) => ({
    ...c,
    timeline: c.timeline ?? [],
    issues: c.issues ?? [],
    provinces: c.provinces ?? [],
    nations: c.nations ?? [],
  }))
  return {
    lastUpdated: file?.lastUpdated ?? '',
    disclaimer: file?.disclaimer ?? '',
    campaigns,
    organizations: Array.isArray(file?.organizations) ? file.organizations : [],
    learningTopics: Array.isArray(file?.learningTopics) ? file.learningTopics : [],
    newsSources: Array.isArray(file?.newsSources) ? file.newsSources : [],
    events: Array.isArray(file?.events) ? file.events : [],
  }
}

export function getCampaignBySlug(file: IndigenousHubFile, slug: string): IndigenousCampaign | undefined {
  return file.campaigns.find((c) => c.slug === slug)
}

export function getLearningTopicBySlug(file: IndigenousHubFile, slug: string): LearningTopic | undefined {
  return file.learningTopics.find((t) => t.slug === slug)
}

export function getOrganizationBySlug(file: IndigenousHubFile, slug: string): IndigenousOrganization | undefined {
  return file.organizations.find((o) => o.slug === slug)
}

export function filterCampaigns(
  campaigns: IndigenousCampaign[],
  opts: {
    province?: IndigenousProvince | 'all'
    issue?: CampaignIssue | 'all'
    status?: CampaignStatus | 'all'
    q?: string
  }
): IndigenousCampaign[] {
  const q = opts.q?.trim().toLowerCase()
  return campaigns.filter((c) => {
    if (opts.province && opts.province !== 'all' && !c.provinces.includes(opts.province)) return false
    if (opts.issue && opts.issue !== 'all' && !c.issues.includes(opts.issue)) return false
    if (opts.status && opts.status !== 'all' && c.status !== opts.status) return false
    if (!q) return true
    const hay = [c.title, c.summary, ...c.nations, ...c.issues].join(' ').toLowerCase()
    return hay.includes(q)
  })
}

export function indigenousHubPath(...segments: string[]): string {
  const parts = segments.filter(Boolean).map((s) => s.replace(/^\/+|\/+$/g, ''))
  return `/indigenous${parts.length ? `/${parts.join('/')}` : ''}/`
}
