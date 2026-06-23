'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

type DeliveryStatus = 'new' | 'paid' | 'delivered'

type SignRequest = {
  id?: string
  submittedAt?: string
  name?: string
  email?: string
  phone?: string
  city?: string
  postalCode?: string
  yardSignDesign?: string
  yardSignQuantity?: string
  yardSignPaymentStatus?: string
  yardSignNotes?: string
  deliveryStatus?: DeliveryStatus
  territoryArea?: string
  regionalLeadId?: string
  regionalLeadName?: string
  hubName?: string
  hubPhone?: string
}

type Lead = { id: string; name: string; email?: string }

type TerritoryArea = {
  id: string
  area: string
  hubName: string
  hubPhone?: string
}

type LeadStructure = {
  id: string
  name: string
  email: string
  areas: TerritoryArea[]
}

type Payload = {
  fetchedAt?: string
  leads?: Lead[]
  territoryStructure?: LeadStructure[]
  requests?: SignRequest[]
  summary?: {
    total?: number
    new?: number
    paid?: number
    delivered?: number
    unassigned?: number
  }
}

type ViewId = 'requests' | 'areas'

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  new: 'Waiting',
  paid: 'Paid',
  delivered: 'Delivered',
}

const STATUS_STYLES: Record<DeliveryStatus, string> = {
  new: 'bg-amber-100 text-amber-950 border-amber-200',
  paid: 'bg-sky-100 text-sky-950 border-sky-200',
  delivered: 'bg-emerald-100 text-emerald-950 border-emerald-200',
}

function formatDate(iso?: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function matchesSearch(row: SignRequest, query: string) {
  if (!query) return true
  const blob = [
    row.name,
    row.email,
    row.phone,
    row.city,
    row.postalCode,
    row.territoryArea,
    row.regionalLeadName,
    row.hubName,
    row.yardSignNotes,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return blob.includes(query.toLowerCase())
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900 tabular-nums">{value}</p>
    </div>
  )
}

function LeadEmailEditor({
  lead,
  onSaved,
}: {
  lead: LeadStructure
  onSaved: (updated: LeadStructure) => void
}) {
  const [email, setEmail] = useState(lead.email)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setEmail(lead.email)
  }, [lead.email])

  const save = async () => {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/sign-deliveries/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const body = (await res.json()) as { error?: string; lead?: LeadStructure }
      if (!res.ok) {
        throw new Error(body.error || `Save failed (${res.status})`)
      }
      if (body.lead) {
        onSaved(body.lead)
      }
      setMessage('Saved — new sign requests in their areas will email this address.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save email')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-3 mb-4">
      <label className="block text-xs font-semibold uppercase tracking-wider text-violet-800 mb-1.5">
        Alert email for {lead.name}
      </label>
      <p className="text-xs text-slate-600 mb-2">
        When someone requests a sign in one of {lead.name}&apos;s areas, this inbox gets notified.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="organizer@example.com"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-300"
        />
        <button
          type="button"
          onClick={save}
          disabled={saving || !email.trim()}
          className="rounded-lg bg-[#3d2b7a] text-white px-4 py-2 text-sm font-medium hover:bg-[#2a1f58] disabled:opacity-50 shrink-0"
        >
          {saving ? 'Saving…' : 'Save email'}
        </button>
      </div>
      {message ? <p className="mt-2 text-xs text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
    </div>
  )
}

function AreaHubEditor({
  area,
  onSaved,
}: {
  area: TerritoryArea
  onSaved: (updated: TerritoryArea) => void
}) {
  const [hubName, setHubName] = useState(area.hubName)
  const [hubPhone, setHubPhone] = useState(area.hubPhone || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setHubName(area.hubName)
    setHubPhone(area.hubPhone || '')
  }, [area.hubName, area.hubPhone])

  const save = async () => {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/sign-deliveries/territories/${area.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hubName, hubPhone }),
      })
      const body = (await res.json()) as { error?: string; area?: TerritoryArea }
      if (!res.ok) {
        throw new Error(body.error || `Save failed (${res.status})`)
      }
      if (body.area) {
        onSaved(body.area)
      }
      setMessage('Saved.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save contact')
    } finally {
      setSaving(false)
    }
  }

  return (
    <li className="px-4 py-3 text-sm bg-slate-50/50 even:bg-white">
      <p className="font-medium text-slate-900 mb-2">{area.area}</p>
      <div className="grid sm:grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Local contact name</label>
          <input
            type="text"
            value={hubName}
            onChange={(e) => setHubName(e.target.value)}
            placeholder="Name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Phone (optional)</label>
          <input
            type="tel"
            value={hubPhone}
            onChange={(e) => setHubPhone(e.target.value)}
            placeholder="416-555-0100"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving || !hubName.trim() || !area.id}
          className="rounded-lg border border-slate-300 bg-white text-slate-700 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save contact'}
        </button>
        {message ? <span className="text-xs text-emerald-700">{message}</span> : null}
        {error ? <span className="text-xs text-red-700">{error}</span> : null}
      </div>
    </li>
  )
}

export default function SignDeliveriesAdminSection({ embedded = false }: { embedded?: boolean }) {
  const [view, setView] = useState<ViewId>('requests')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Payload | null>(null)
  const [query, setQuery] = useState('')
  const [leadFilter, setLeadFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | DeliveryStatus>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/sign-deliveries')
      const body = (await res.json()) as Payload & { error?: string; message?: string }
      if (!res.ok) {
        throw new Error(body.message || body.error || `Request failed (${res.status})`)
      }
      setData(body)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load sign requests')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const updateStatus = async (id: string, deliveryStatus: DeliveryStatus) => {
    setUpdatingId(id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/sign-deliveries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryStatus }),
      })
      const body = (await res.json()) as { error?: string; request?: SignRequest }
      if (!res.ok) {
        throw new Error(body.error || `Update failed (${res.status})`)
      }
      setData((prev) => {
        if (!prev?.requests || !body.request) return prev
        const requests = prev.requests.map((row) => (row.id === id ? body.request! : row))
        const counts = { new: 0, paid: 0, delivered: 0, unassigned: 0 }
        for (const row of requests) {
          const s = (row.deliveryStatus || 'new') as DeliveryStatus
          if (s === 'paid') counts.paid += 1
          else if (s === 'delivered') counts.delivered += 1
          else counts.new += 1
          if (!row.regionalLeadId) counts.unassigned += 1
        }
        return {
          ...prev,
          requests,
          summary: {
            total: requests.length,
            ...counts,
          },
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update status')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleLeadEmailSaved = (updated: LeadStructure) => {
    setData((prev) => {
      if (!prev) return prev
      const territoryStructure = (prev.territoryStructure || []).map((lead) =>
        lead.id === updated.id ? updated : lead
      )
      const leads = (prev.leads || []).map((lead) =>
        lead.id === updated.id ? { ...lead, email: updated.email } : lead
      )
      return { ...prev, territoryStructure, leads }
    })
  }

  const handleAreaHubSaved = (updated: TerritoryArea) => {
    setData((prev) => {
      if (!prev?.territoryStructure) return prev
      const territoryStructure = prev.territoryStructure.map((lead) => ({
        ...lead,
        areas: lead.areas.map((area) => (area.id === updated.id ? updated : area)),
      }))
      return { ...prev, territoryStructure }
    })
  }

  const requests = useMemo(() => {
    let rows = data?.requests || []
    if (leadFilter === 'unassigned') {
      rows = rows.filter((row) => !row.regionalLeadId)
    } else if (leadFilter !== 'all') {
      rows = rows.filter((row) => row.regionalLeadId === leadFilter)
    }
    if (statusFilter !== 'all') {
      rows = rows.filter((row) => (row.deliveryStatus || 'new') === statusFilter)
    }
    if (query) {
      rows = rows.filter((row) => matchesSearch(row, query))
    }
    return rows
  }, [data?.requests, leadFilter, statusFilter, query])

  const summary = data?.summary
  const structure = data?.territoryStructure || []

  return (
    <div className={embedded ? '' : 'min-h-screen bg-slate-50 py-8 px-4'}>
      <div className={embedded ? '' : 'max-w-6xl mx-auto'}>
        {!embedded && (
          <header className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-900">Yard sign deliveries</h1>
            <p className="mt-2 text-slate-600 font-light max-w-2xl">
              Track sign requests, see which organizer covers each area, and set where alerts are sent.
            </p>
          </header>
        )}

        {embedded && (
          <div className="mb-6 pb-6 border-b border-slate-200">
            <h2 className="text-lg font-medium text-slate-900">Yard sign deliveries</h2>
            <p className="text-sm text-slate-600 font-light mt-1">
              New requests are emailed to the regional lead for that area. Mark payment and delivery on each card.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <nav className="flex rounded-full border border-slate-200 bg-white p-1 shadow-sm" aria-label="Views">
            <button
              type="button"
              onClick={() => setView('requests')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                view === 'requests' ? 'bg-[#3d2b7a] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign requests
            </button>
            <button
              type="button"
              onClick={() => setView('areas')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                view === 'areas' ? 'bg-[#3d2b7a] text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Areas &amp; organizers
            </button>
          </nav>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="rounded-full border border-slate-300 bg-white text-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
          {data?.fetchedAt ? (
            <span className="text-xs text-slate-500">Last updated {formatDate(data.fetchedAt)}</span>
          ) : null}
        </div>

        {error ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {view === 'areas' ? (
          <div className="space-y-6">
            <p className="text-sm text-slate-600 max-w-3xl">
              Each regional lead covers the areas listed below. Set their email so they receive an alert when someone
              nearby requests a yard sign. Edit the local contact for each area — that is who usually hands out signs.
            </p>
            {!structure.length && !loading ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
                No territory data loaded.
              </div>
            ) : (
              structure.map((lead) => (
                <section
                  key={lead.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm"
                >
                  <h3 className="text-lg font-medium text-slate-900 mb-1">{lead.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    {lead.areas.length} area{lead.areas.length === 1 ? '' : 's'}
                  </p>

                  <LeadEmailEditor lead={lead} onSaved={handleLeadEmailSaved} />

                  <ul className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {lead.areas.map((area) => (
                      <AreaHubEditor key={area.id || `${lead.id}-${area.area}`} area={area} onSaved={handleAreaHubSaved} />
                    ))}
                  </ul>
                </section>
              ))
            )}
          </div>
        ) : (
          <>
            {summary ? (
              <div className="grid grid-cols-2 gap-3 mb-6 max-w-md">
                <SummaryCard label="Paid" value={summary.paid || 0} />
                <SummaryCard label="Delivered" value={summary.delivered || 0} />
              </div>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, city, email…"
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
              <select
                value={leadFilter}
                onChange={(e) => setLeadFilter(e.target.value)}
                className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm bg-white"
                aria-label="Filter by regional lead"
              >
                <option value="all">All regional leads</option>
                {(data?.leads || []).map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name}
                  </option>
                ))}
                <option value="unassigned">Unassigned only</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | DeliveryStatus)}
                className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm bg-white"
                aria-label="Filter by status"
              >
                <option value="all">All statuses</option>
                <option value="new">Waiting</option>
                <option value="paid">Paid</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            {leadFilter === 'unassigned' && (
              <p className="mb-4 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                Showing requests we could not match to a regional area. Check the Areas &amp; organizers tab or contact
                protectont@gmail.com.
              </p>
            )}

            {!requests.length && !loading ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
                No yard sign requests match your filters.
              </div>
            ) : (
              <ul className="space-y-4">
                {requests.map((row) => {
                  const status = (row.deliveryStatus || 'new') as DeliveryStatus
                  const busy = updatingId === row.id

                  return (
                    <li
                      key={row.id || `${row.submittedAt}-${row.email}`}
                      className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-slate-900">{row.name || 'No name'}</h3>
                          <p className="text-sm text-slate-500 mt-0.5">Requested {formatDate(row.submittedAt)}</p>
                        </div>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${STATUS_STYLES[status]}`}
                        >
                          {STATUS_LABELS[status]}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <p>
                            <span className="text-slate-500">Contact:</span>{' '}
                            {row.email ? (
                              <a href={`mailto:${row.email}`} className="text-[#3d2b7a] hover:underline">
                                {row.email}
                              </a>
                            ) : (
                              '—'
                            )}
                            {row.phone ? (
                              <>
                                {' · '}
                                <a href={`tel:${row.phone}`} className="text-[#3d2b7a] hover:underline">
                                  {row.phone}
                                </a>
                              </>
                            ) : null}
                          </p>
                          <p>
                            <span className="text-slate-500">Location:</span> {row.city || '—'}
                            {row.postalCode ? ` (${row.postalCode})` : ''}
                          </p>
                          <p>
                            <span className="text-slate-500">Signs:</span>{' '}
                            {row.yardSignQuantity || '1'}
                            {row.yardSignDesign ? ` · ${row.yardSignDesign}` : ''}
                          </p>
                          <p>
                            <span className="text-slate-500">Payment (they said):</span>{' '}
                            {row.yardSignPaymentStatus || 'Not specified'}
                          </p>
                          {row.yardSignNotes ? (
                            <p>
                              <span className="text-slate-500">Delivery notes:</span> {row.yardSignNotes}
                            </p>
                          ) : null}
                        </div>

                        <div className="rounded-xl bg-violet-50 border border-violet-100 p-3 space-y-1.5">
                          <p className="text-xs font-semibold uppercase tracking-wider text-violet-800">
                            Who handles this area
                          </p>
                          <p className="font-medium text-slate-900">
                            {row.regionalLeadName || 'Unassigned'}
                            {row.territoryArea ? ` · ${row.territoryArea}` : ''}
                          </p>
                          {row.hubName ? (
                            <p className="text-slate-700">
                              Local contact: {row.hubName}
                              {row.hubPhone ? (
                                <>
                                  {' · '}
                                  <a href={`tel:${row.hubPhone}`} className="text-[#3d2b7a] hover:underline">
                                    {row.hubPhone}
                                  </a>
                                </>
                              ) : null}
                            </p>
                          ) : (
                            <p className="text-slate-600 text-sm">No local hub on file for this area.</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                        {status !== 'paid' && status !== 'delivered' ? (
                          <button
                            type="button"
                            disabled={busy || !row.id}
                            onClick={() => row.id && updateStatus(row.id, 'paid')}
                            className="rounded-full bg-sky-600 text-white px-4 py-2 text-sm font-medium hover:bg-sky-700 disabled:opacity-50"
                          >
                            Mark as paid
                          </button>
                        ) : null}
                        {status !== 'delivered' ? (
                          <button
                            type="button"
                            disabled={busy || !row.id}
                            onClick={() => row.id && updateStatus(row.id, 'delivered')}
                            className="rounded-full bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                          >
                            Mark as delivered
                          </button>
                        ) : null}
                        {status === 'delivered' ? (
                          <button
                            type="button"
                            disabled={busy || !row.id}
                            onClick={() => row.id && updateStatus(row.id, 'new')}
                            className="rounded-full border border-slate-300 text-slate-700 px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
                          >
                            Move back to waiting
                          </button>
                        ) : null}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  )
}
