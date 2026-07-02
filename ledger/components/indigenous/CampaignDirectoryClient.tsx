'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { CampaignIssue, CampaignStatus, IndigenousCampaign, IndigenousProvince } from '@/lib/indigenous-hub'
import {
  CAMPAIGN_ISSUE_LABELS,
  CAMPAIGN_STATUS_LABELS,
  PROVINCE_LABELS,
  filterCampaigns,
  indigenousHubPath,
} from '@/lib/indigenous-hub'
import CampaignCard from './CampaignCard'

const ALL_PROVINCES: IndigenousProvince[] = [
  'BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU', 'National',
]

function parseProvince(value: string | null): IndigenousProvince | 'all' {
  if (!value) return 'all'
  return ALL_PROVINCES.includes(value as IndigenousProvince) ? (value as IndigenousProvince) : 'all'
}

function parseIssue(value: string | null): CampaignIssue | 'all' {
  if (!value) return 'all'
  return value in CAMPAIGN_ISSUE_LABELS ? (value as CampaignIssue) : 'all'
}

function parseStatus(value: string | null): CampaignStatus | 'all' {
  if (!value) return 'all'
  return value in CAMPAIGN_STATUS_LABELS ? (value as CampaignStatus) : 'all'
}

export default function CampaignDirectoryClient({ campaigns }: { campaigns: IndigenousCampaign[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [q, setQ] = useState(() => searchParams.get('q') ?? '')
  const [province, setProvince] = useState<IndigenousProvince | 'all'>(() => parseProvince(searchParams.get('province')))
  const [issue, setIssue] = useState<CampaignIssue | 'all'>(() => parseIssue(searchParams.get('issue')))
  const [status, setStatus] = useState<CampaignStatus | 'all'>(() => parseStatus(searchParams.get('status')))

  useEffect(() => {
    setQ(searchParams.get('q') ?? '')
    setProvince(parseProvince(searchParams.get('province')))
    setIssue(parseIssue(searchParams.get('issue')))
    setStatus(parseStatus(searchParams.get('status')))
  }, [searchParams])

  useEffect(() => {
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (province !== 'all') params.set('province', province)
    if (issue !== 'all') params.set('issue', issue)
    if (status !== 'all') params.set('status', status)
    const qs = params.toString()
    const next = qs ? `${indigenousHubPath('campaigns')}?${qs}` : indigenousHubPath('campaigns')
    const current = `${indigenousHubPath('campaigns')}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    if (next !== current) {
      router.replace(next, { scroll: false })
    }
  }, [q, province, issue, status, router, searchParams])

  const filtered = useMemo(
    () => filterCampaigns(campaigns, { q, province, issue, status }),
    [campaigns, q, province, issue, status]
  )

  const issueOptions = useMemo(() => {
    const set = new Set<CampaignIssue>()
    campaigns.forEach((c) => c.issues.forEach((i) => set.add(i)))
    return Array.from(set).sort()
  }, [campaigns])

  return (
    <div>
      <div className="rounded-2xl border border-[#1a4d3a]/12 bg-white p-4 sm:p-6 shadow-sm mb-8 space-y-4">
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-[#5a7a66] mb-1.5 block">Search</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nation, issue, campaign name…"
            className="w-full rounded-xl border border-[#1a4d3a]/15 px-4 py-2.5 text-sm bg-[#f4f7f2]/50 focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/25"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-[#5a7a66] mb-1.5 block">Province / territory</span>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value as IndigenousProvince | 'all')}
              className="w-full rounded-xl border border-[#1a4d3a]/15 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/25"
            >
              <option value="all">All regions</option>
              {ALL_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {PROVINCE_LABELS[p]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-[#5a7a66] mb-1.5 block">Issue</span>
            <select
              value={issue}
              onChange={(e) => setIssue(e.target.value as CampaignIssue | 'all')}
              className="w-full rounded-xl border border-[#1a4d3a]/15 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/25"
            >
              <option value="all">All issues</option>
              {issueOptions.map((i) => (
                <option key={i} value={i}>
                  {CAMPAIGN_ISSUE_LABELS[i]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-[#5a7a66] mb-1.5 block">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CampaignStatus | 'all')}
              className="w-full rounded-xl border border-[#1a4d3a]/15 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/25"
            >
              <option value="all">All statuses</option>
              {(Object.keys(CAMPAIGN_STATUS_LABELS) as CampaignStatus[]).map((s) => (
                <option key={s} value={s}>
                  {CAMPAIGN_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-sm text-[#5a7a66] font-light">
          {filtered.length} campaign{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-[#5a7a66] py-16 font-light">No campaigns match your filters.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CampaignCard key={c.slug} campaign={c} />
          ))}
        </div>
      )}
    </div>
  )
}
