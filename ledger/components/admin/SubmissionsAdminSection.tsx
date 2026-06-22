'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

const TOKEN_STORAGE_KEY = 'protectont_submissions_admin_token'

type SignupRow = {
  submittedAt?: string
  request?: string
  roleId?: string
  name?: string
  email?: string
  phone?: string
  city?: string
  postalCode?: string
  yardSignDesign?: string
  yardSignQuantity?: string
  yardSignPaymentStatus?: string
  yardSignNotes?: string
  dropoffLocation?: string
  dropoffAvailability?: string
  dropoffCapacity?: string
  dropoffListPublicly?: string
  volunteerRoles?: string
  volunteerAvailability?: string
  volunteerHasVehicle?: string
  updatesTopics?: string
  additionalNotes?: string
  sourcePage?: string
}

type PaymentRow = {
  id: string
  createdAt?: string
  customerName?: string
  customerEmail?: string
  amount?: number
  currency?: string
  quantity?: number | null
  paymentStatus?: string
  customFields?: Record<string, string>
}

type PrintOrderRow = {
  sessionId?: string
  status?: string
  updatedAt?: string
  product?: string
  size?: string
  printfulOrderId?: string | number | null
  imageUrl?: string
  reason?: string | null
  recipient?: unknown
  stripeEmail?: string
}

type DashboardPayload = {
  fetchedAt?: string
  summary?: {
    signupsTotal?: number
    signupsThisMonth?: number
    paymentsTotal?: number
    paymentsThisMonth?: number
    paymentsAmountTotal?: number
    paymentsAmountThisMonth?: number
    printOrdersPending?: number
    printOrdersFulfilled?: number
  }
  signups?: SignupRow[]
  payments?: PaymentRow[]
  printOrders?: PrintOrderRow[]
  errors?: {
    signups?: string | null
    payments?: string | null
  }
}

type TabId = 'signups' | 'payments' | 'print'

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

function formatMoney(amount?: number, currency = 'CAD') {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency }).format(amount)
}

function requestBadgeClass(request?: string) {
  const value = (request || '').toLowerCase()
  if (value.includes('sign') || value.includes('yard')) return 'bg-amber-100 text-amber-900 border-amber-200'
  if (value.includes('drop')) return 'bg-sky-100 text-sky-900 border-sky-200'
  if (value.includes('volunteer')) return 'bg-emerald-100 text-emerald-900 border-emerald-200'
  return 'bg-slate-100 text-slate-800 border-slate-200'
}

function matchesSearch(text: string, query: string) {
  if (!query) return true
  return text.toLowerCase().includes(query.toLowerCase())
}

function signupSearchBlob(row: SignupRow) {
  return Object.values(row).join(' ')
}

function paymentSearchBlob(row: PaymentRow) {
  const custom = Object.entries(row.customFields || {})
    .map(([k, v]) => `${k} ${v}`)
    .join(' ')
  return [row.customerName, row.customerEmail, row.id, custom].join(' ')
}

function printSearchBlob(row: PrintOrderRow) {
  return [row.sessionId, row.product, row.size, row.reason, row.stripeEmail, String(row.printfulOrderId || '')].join(' ')
}

function SummaryCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900 tabular-nums">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-slate-500">{sub}</p> : null}
    </div>
  )
}

function TokenGate({
  token,
  onSave,
}: {
  token: string
  onSave: (token: string) => void
}) {
  const [draft, setDraft] = useState(token)

  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50/80 p-5 sm:p-6">
      <h3 className="text-base font-medium text-slate-900">Admin access token</h3>
      <p className="mt-1 text-sm text-slate-600 font-light">
        Enter the server token (<code className="text-xs bg-white/80 px-1 rounded">SUBMISSIONS_ADMIN_TOKEN</code> or{' '}
        <code className="text-xs bg-white/80 px-1 rounded">POSTER_ADMIN_TOKEN</code>). Stored in this browser only.
      </p>
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <input
          type="password"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Bearer token"
          className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
        <button
          type="button"
          onClick={() => onSave(draft.trim())}
          disabled={!draft.trim()}
          className="rounded-xl bg-[#3d2b7a] px-4 py-2 text-sm font-medium text-white hover:bg-[#2a1f58] disabled:opacity-50"
        >
          Unlock dashboard
        </button>
      </div>
    </div>
  )
}

function DataTable({
  headers,
  rows,
  emptyMessage,
}: {
  headers: { key: string; label: string; className?: string }[]
  rows: { key: string; cells: Record<string, React.ReactNode> }[]
  emptyMessage: string
}) {
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/90">
              {headers.map((h) => (
                <th
                  key={h.key}
                  className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap ${h.className || ''}`}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.key} className="hover:bg-slate-50/60 align-top">
                {headers.map((h) => (
                  <td key={h.key} className={`px-3 py-3 text-slate-700 ${h.className || ''}`}>
                    {row.cells[h.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function SubmissionsAdminSection({ embedded = false }: { embedded?: boolean }) {
  const [token, setToken] = useState('')
  const [tab, setTab] = useState<TabId>('signups')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardPayload | null>(null)

  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_STORAGE_KEY)
    if (saved) setToken(saved)
  }, [])

  const saveToken = (value: string) => {
    setToken(value)
    if (value) sessionStorage.setItem(TOKEN_STORAGE_KEY, value)
    else sessionStorage.removeItem(TOKEN_STORAGE_KEY)
  }

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/submissions-dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const body = (await res.json()) as DashboardPayload & { error?: string; message?: string }
      if (!res.ok) {
        throw new Error(body.message || body.error || `Request failed (${res.status})`)
      }
      setData(body)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load dashboard')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) load()
  }, [token, load])

  const signups = useMemo(() => {
    const rows = data?.signups || []
    if (!query) return rows
    return rows.filter((row) => matchesSearch(signupSearchBlob(row), query))
  }, [data?.signups, query])

  const payments = useMemo(() => {
    const rows = data?.payments || []
    if (!query) return rows
    return rows.filter((row) => matchesSearch(paymentSearchBlob(row), query))
  }, [data?.payments, query])

  const printOrders = useMemo(() => {
    const rows = data?.printOrders || []
    if (!query) return rows
    return rows.filter((row) => matchesSearch(printSearchBlob(row), query))
  }, [data?.printOrders, query])

  const customFieldLabels = useMemo(() => {
    const labels = new Set<string>()
    for (const row of data?.payments || []) {
      Object.keys(row.customFields || {}).forEach((k) => labels.add(k))
    }
    return Array.from(labels)
  }, [data?.payments])

  const exportCsv = () => {
    let headers: string[] = []
    let lines: string[][] = []

    if (tab === 'signups') {
      headers = [
        'Submitted',
        'Request',
        'Name',
        'Email',
        'Phone',
        'City',
        'Postal',
        'Sign design',
        'Sign qty',
        'Payment',
        'Notes',
      ]
      lines = signups.map((r) => [
        r.submittedAt || '',
        r.request || '',
        r.name || '',
        r.email || '',
        r.phone || '',
        r.city || '',
        r.postalCode || '',
        r.yardSignDesign || '',
        r.yardSignQuantity || '',
        r.yardSignPaymentStatus || '',
        r.yardSignNotes || r.additionalNotes || '',
      ])
    } else if (tab === 'payments') {
      headers = ['Date', 'Name', 'Email', 'Amount', 'Currency', 'Quantity', ...customFieldLabels]
      lines = payments.map((r) => [
        r.createdAt || '',
        r.customerName || '',
        r.customerEmail || '',
        String(r.amount ?? ''),
        r.currency || '',
        String(r.quantity ?? ''),
        ...customFieldLabels.map((label) => r.customFields?.[label] || ''),
      ])
    } else {
      headers = ['Updated', 'Status', 'Session', 'Product', 'Size', 'Printful ID', 'Reason', 'Email']
      lines = printOrders.map((r) => [
        r.updatedAt || '',
        r.status || '',
        r.sessionId || '',
        r.product || '',
        r.size || '',
        String(r.printfulOrderId || ''),
        r.reason || '',
        r.stripeEmail || '',
      ])
    }

    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
    const csv = [headers.map(escape).join(','), ...lines.map((row) => row.map(escape).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `protectont-${tab}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const summary = data?.summary

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white py-8'}>
      <div className="space-y-6">
        {embedded ? (
          <div className="mb-2">
            <h2 className="text-lg font-medium text-slate-900">Sign-ups & orders</h2>
            <p className="text-sm text-slate-600 font-light mt-1">
              Join form sign-ups (saved on server), Stripe checkout payments, and poster/shirt fulfillment.
            </p>
          </div>
        ) : null}
        {!token ? (
          <TokenGate token={token} onSave={saveToken} />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500">
                  Last refreshed {data?.fetchedAt ? formatDate(data.fetchedAt) : '—'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => saveToken('')}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                >
                  Lock
                </button>
                <button
                  type="button"
                  onClick={load}
                  disabled={loading}
                  className="rounded-full bg-[#3d2b7a] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#2a1f58] disabled:opacity-60"
                >
                  {loading ? 'Refreshing…' : 'Refresh'}
                </button>
                <button
                  type="button"
                  onClick={exportCsv}
                  disabled={!data}
                  className="rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-medium text-[#3d2b7a] hover:bg-violet-100 disabled:opacity-50"
                >
                  Export CSV
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
            ) : null}

            {(data?.errors?.signups || data?.errors?.payments) && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 space-y-1">
                {data.errors.signups ? <p>Sign-ups: {data.errors.signups}</p> : null}
                {data.errors.payments ? <p>Stripe: {data.errors.payments}</p> : null}
              </div>
            )}

            {summary ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <SummaryCard label="Sign-ups" value={summary.signupsTotal ?? 0} sub={`${summary.signupsThisMonth ?? 0} this month`} />
                <SummaryCard
                  label="Stripe payments"
                  value={summary.paymentsTotal ?? 0}
                  sub={`${summary.paymentsThisMonth ?? 0} this month`}
                />
                <SummaryCard
                  label="Revenue (paid)"
                  value={formatMoney(summary.paymentsAmountTotal)}
                  sub={`${formatMoney(summary.paymentsAmountThisMonth)} this month`}
                />
                <SummaryCard
                  label="Print orders"
                  value={(summary.printOrdersFulfilled ?? 0) + (summary.printOrdersPending ?? 0)}
                  sub={`${summary.printOrdersPending ?? 0} pending`}
                />
              </div>
            ) : null}

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <nav className="flex flex-wrap gap-2" aria-label="Submission views">
                {(
                  [
                    ['signups', `Sign-ups (${data?.signups?.length ?? 0})`],
                    ['payments', `Stripe (${data?.payments?.length ?? 0})`],
                    ['print', `Print (${data?.printOrders?.length ?? 0})`],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      tab === id
                        ? 'bg-[#3d2b7a] text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </nav>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search current tab…"
                className="sm:ml-auto w-full sm:w-64 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
            </div>

            {tab === 'signups' && (
              <DataTable
                headers={[
                  { key: 'when', label: 'Submitted' },
                  { key: 'request', label: 'Request' },
                  { key: 'contact', label: 'Contact' },
                  { key: 'location', label: 'Location' },
                  { key: 'details', label: 'Details' },
                ]}
                emptyMessage="No sign-ups loaded yet."
                rows={signups.map((row, i) => ({
                  key: `${row.email}-${row.submittedAt}-${i}`,
                  cells: {
                    when: <span className="whitespace-nowrap text-slate-600">{formatDate(row.submittedAt)}</span>,
                    request: (
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${requestBadgeClass(row.request)}`}
                      >
                        {row.request || row.roleId || '—'}
                      </span>
                    ),
                    contact: (
                      <div className="min-w-[10rem]">
                        <p className="font-medium text-slate-900">{row.name || '—'}</p>
                        <p className="text-slate-600">{row.email || '—'}</p>
                        {row.phone ? <p className="text-slate-500 text-xs mt-0.5">{row.phone}</p> : null}
                      </div>
                    ),
                    location: (
                      <div className="min-w-[8rem]">
                        <p>{row.city || '—'}</p>
                        {row.postalCode ? <p className="text-xs text-slate-500">{row.postalCode}</p> : null}
                      </div>
                    ),
                    details: (
                      <div className="max-w-md text-xs text-slate-600 space-y-1">
                        {row.yardSignDesign ? <p>Sign: {row.yardSignDesign} × {row.yardSignQuantity || '?'}</p> : null}
                        {row.yardSignPaymentStatus ? <p>Payment: {row.yardSignPaymentStatus}</p> : null}
                        {row.dropoffLocation ? <p>Drop-off: {row.dropoffLocation}</p> : null}
                        {row.volunteerRoles ? <p>Volunteer: {row.volunteerRoles}</p> : null}
                        {row.yardSignNotes || row.additionalNotes ? (
                          <p className="text-slate-500">{row.yardSignNotes || row.additionalNotes}</p>
                        ) : null}
                      </div>
                    ),
                  },
                }))}
              />
            )}

            {tab === 'payments' && (
              <DataTable
                headers={[
                  { key: 'when', label: 'Date' },
                  { key: 'customer', label: 'Customer' },
                  { key: 'amount', label: 'Amount' },
                  { key: 'qty', label: 'Qty' },
                  ...customFieldLabels.map((label) => ({ key: label, label })),
                ]}
                emptyMessage="No paid Stripe checkout sessions found."
                rows={payments.map((row) => ({
                  key: row.id,
                  cells: {
                    when: <span className="whitespace-nowrap">{formatDate(row.createdAt)}</span>,
                    customer: (
                      <div>
                        <p className="font-medium text-slate-900">{row.customerName || '—'}</p>
                        <p className="text-slate-600">{row.customerEmail || '—'}</p>
                      </div>
                    ),
                    amount: (
                      <span className="font-medium tabular-nums">
                        {formatMoney(row.amount, row.currency || 'CAD')}
                      </span>
                    ),
                    qty: <span className="tabular-nums">{row.quantity ?? '—'}</span>,
                    ...Object.fromEntries(
                      customFieldLabels.map((label) => [
                        label,
                        <span key={label} className="text-slate-600">
                          {row.customFields?.[label] || '—'}
                        </span>,
                      ])
                    ),
                  },
                }))}
              />
            )}

            {tab === 'print' && (
              <DataTable
                headers={[
                  { key: 'when', label: 'Updated' },
                  { key: 'status', label: 'Status' },
                  { key: 'product', label: 'Product' },
                  { key: 'session', label: 'Session' },
                  { key: 'notes', label: 'Notes' },
                ]}
                emptyMessage="No poster or shirt fulfillment records yet."
                rows={printOrders.map((row) => ({
                  key: row.sessionId || String(row.updatedAt),
                  cells: {
                    when: <span className="whitespace-nowrap">{formatDate(row.updatedAt)}</span>,
                    status: (
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                          row.status === 'pending'
                            ? 'bg-amber-100 text-amber-900 border-amber-200'
                            : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                        }`}
                      >
                        {row.status || '—'}
                      </span>
                    ),
                    product: (
                      <div>
                        <p className="font-medium capitalize">{row.product || '—'}</p>
                        <p className="text-xs text-slate-500">{row.size || ''}</p>
                        {row.printfulOrderId ? (
                          <p className="text-xs text-slate-500">Printful #{row.printfulOrderId}</p>
                        ) : null}
                      </div>
                    ),
                    session: (
                      <code className="text-xs text-slate-600 break-all">{row.sessionId || '—'}</code>
                    ),
                    notes: (
                      <div className="max-w-sm text-xs text-slate-600">
                        {row.reason ? <p>{row.reason}</p> : null}
                        {row.stripeEmail ? <p>{row.stripeEmail}</p> : null}
                        {row.imageUrl ? (
                          <a href={row.imageUrl} target="_blank" rel="noopener noreferrer" className="text-[#3d2b7a] hover:underline">
                            Artwork
                          </a>
                        ) : null}
                      </div>
                    ),
                  },
                }))}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
