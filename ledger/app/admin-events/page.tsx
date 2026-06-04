'use client'

import Link from 'next/link'
import { useState, useRef, useEffect, useMemo } from 'react'
import { getPublicDataFile } from '../../utils/dataPath'
import {
  type Protest,
  type ProtestTopicId,
  type ProtestStatus,
  type ProtestsFile,
  type FeaturedCampaign,
  PROTEST_TOPICS,
  PROTEST_STATUSES,
  parseProtestsFile,
  serializeProtestsFile,
  isValidProtestDate,
  parseProtestDate,
  validateEvents,
} from '../../lib/protests'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

type EventForm = {
  title: string
  date: string
  location: string
  description: string
  link: string
  organizer: string
  address: string
  campaignId: string
  status: ProtestStatus
  featured: boolean
  topics: ProtestTopicId[]
}

const emptyForm = (): EventForm => ({
  title: '',
  date: '',
  location: '',
  description: '',
  link: '',
  organizer: '',
  address: '',
  campaignId: '',
  status: 'confirmed',
  featured: false,
  topics: [],
})

function CollapsibleSection({
  title,
  subtitle,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  accent = 'slate',
  children,
}: {
  title: string
  subtitle?: string
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  accent?: 'slate' | 'rose' | 'blue'
  children: React.ReactNode
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const open = controlledOpen ?? internalOpen
  const setOpen = (value: boolean | ((v: boolean) => boolean)) => {
    const next = typeof value === 'function' ? value(open) : value
    onOpenChange?.(next)
    if (controlledOpen === undefined) setInternalOpen(next)
  }
  const accentBorder =
    accent === 'rose' ? 'border-rose-200' : accent === 'blue' ? 'border-blue-200' : 'border-slate-200'
  const accentBg =
    accent === 'rose' ? 'bg-rose-50/80' : accent === 'blue' ? 'bg-blue-50/50' : 'bg-white'

  return (
    <div className={`rounded-2xl border ${accentBorder} ${accentBg} shadow-sm overflow-hidden mb-6`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-4 px-5 py-4 sm:px-6 text-left hover:bg-white/60 transition-colors"
        aria-expanded={open}
      >
        <span>
          <span className="block text-lg font-medium text-slate-900">{title}</span>
          {subtitle && <span className="block text-sm text-slate-500 font-light mt-0.5">{subtitle}</span>}
        </span>
        <span className="text-slate-400 text-xl shrink-0 mt-0.5" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 border-t border-slate-100/80">{children}</div>}
    </div>
  )
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Protest[]>([])
  const [lastUpdated, setLastUpdated] = useState('')
  const [featuredCampaign, setFeaturedCampaign] = useState<FeaturedCampaign>({
    enabled: true,
    label: '',
    href: '#event-list',
  })
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ok' | 'empty' | 'error'>('loading')
  const [form, setForm] = useState<EventForm>(emptyForm())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveError, setSaveError] = useState('')
  const [addFormOpen, setAddFormOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipBannerPersistRef = useRef(true)

  const applyFile = (file: ProtestsFile) => {
    setEvents(file.events)
    setLastUpdated(file.lastUpdated ?? '')
    if (file.featuredCampaign) {
      setFeaturedCampaign({
        enabled: file.featuredCampaign.enabled ?? false,
        label: file.featuredCampaign.label ?? '',
        href: file.featuredCampaign.href ?? '#event-list',
        campaignId: file.featuredCampaign.campaignId,
      })
    }
    setLoadStatus(file.events.length > 0 ? 'ok' : 'empty')
  }

  useEffect(() => {
    let cancelled = false
    fetch(getPublicDataFile('protests.json'), { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (cancelled) return
        applyFile(parseProtestsFile(data))
      })
      .catch(() => {
        if (!cancelled) setLoadStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const persistToServer = async (file: ProtestsFile) => {
    setSaveStatus('saving')
    setSaveError('')
    try {
      const res = await fetch('/api/protectont/protests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: serializeProtestsFile(file),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSaveStatus('error')
        const err = (body as { error?: string; message?: string }).error
        const msg = (body as { message?: string }).message
        if (res.status === 503) {
          setSaveError(msg || 'Live save is disabled on the server.')
        } else if (res.status === 403) {
          setSaveError(msg || 'Save must be sent from protectont.ca/admin-events.')
        } else {
          setSaveError(err || `Save failed (${res.status})`)
        }
        return
      }
      setSaveStatus('saved')
      setLastUpdated(file.lastUpdated ?? new Date().toISOString().slice(0, 10))
    } catch {
      setSaveStatus('error')
      setSaveError('Network error — could not reach the server')
    }
  }

  const schedulePersist = (file: ProtestsFile) => {
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current)
    persistTimerRef.current = setTimeout(() => {
      void persistToServer(file)
    }, 600)
  }

  const validation = useMemo(() => validateEvents(events), [events])
  const visibleCount = validation.filter((v) => v.visible).length
  const needsDateFix = validation.filter((v) => !v.dateOk).length

  /** Newest first; events without a parseable date sink to the bottom */
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const ta = parseProtestDate(a.date)?.getTime()
      const tb = parseProtestDate(b.date)?.getTime()
      if (ta != null && tb != null) return tb - ta
      if (ta != null) return -1
      if (tb != null) return 1
      return 0
    })
  }, [events])

  /** Month groups preserve newest-first order (first group = most recent month) */
  const eventsByMonth = useMemo(() => {
    const groups: { key: string; label: string; items: Protest[] }[] = []
    const indexByKey = new Map<string, number>()
    for (const p of sortedEvents) {
      const d = parseProtestDate(p.date)
      const key = d
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        : 'unknown'
      const label = d
        ? d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
        : 'Date not set'
      const idx = indexByKey.get(key)
      if (idx === undefined) {
        indexByKey.set(key, groups.length)
        groups.push({ key, label, items: [p] })
      } else {
        groups[idx].items.push(p)
      }
    }
    return groups
  }, [sortedEvents])

  const buildFile = (): ProtestsFile => ({
    lastUpdated: lastUpdated || new Date().toISOString().slice(0, 10),
    featuredCampaign: featuredCampaign.label.trim() ? featuredCampaign : undefined,
    events,
  })

  useEffect(() => {
    if (loadStatus !== 'ok') return
    if (skipBannerPersistRef.current) {
      skipBannerPersistRef.current = false
      return
    }
    schedulePersist(buildFile())
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce banner/meta only
  }, [featuredCampaign, lastUpdated, loadStatus])

  const formToEvent = (id: string): Protest => {
    const base: Protest = {
      id,
      title: form.title.trim(),
      date: form.date.trim() || 'TBD',
      location: form.location.trim() || 'TBD',
      status: form.status,
      featured: form.featured || undefined,
    }
    if (form.description.trim()) base.description = form.description.trim()
    if (form.link.trim()) base.link = form.link.trim()
    if (form.organizer.trim()) base.organizer = form.organizer.trim()
    if (form.address.trim()) base.address = form.address.trim()
    if (form.campaignId.trim()) base.campaignId = form.campaignId.trim()
    if (form.topics.length) base.topics = form.topics
    return base
  }

  const loadEventIntoForm = (p: Protest) => {
    setForm({
      title: p.title,
      date: p.date,
      location: p.location,
      description: p.description ?? '',
      link: p.link ?? '',
      organizer: p.organizer ?? '',
      address: p.address ?? '',
      campaignId: p.campaignId ?? '',
      status: p.status ?? 'confirmed',
      featured: !!p.featured,
      topics: p.topics ?? [],
    })
    setEditingId(p.id)
    setAddFormOpen(true)
  }

  const handleSave = () => {
    if (!form.title.trim()) return
    const id = editingId ?? `${slugify(form.title)}-${slugify(form.date) || Date.now()}`
    const event = formToEvent(id)
    let nextEvents: Protest[]
    if (editingId) {
      nextEvents = events.map((p) => (p.id === editingId ? event : p))
      setEvents(nextEvents)
    } else {
      nextEvents = [...events, event]
      setEvents(nextEvents)
    }
    setForm(emptyForm())
    setEditingId(null)
    const file: ProtestsFile = {
      lastUpdated: lastUpdated || new Date().toISOString().slice(0, 10),
      featuredCampaign: featuredCampaign.label.trim() ? featuredCampaign : undefined,
      events: nextEvents,
    }
    void persistToServer(file)
  }

  const handleCancelEdit = () => {
    setForm(emptyForm())
    setEditingId(null)
    setAddFormOpen(false)
  }

  const handleRemove = (id: string) => {
    if (!window.confirm('Remove this event from the list?')) return
    const nextEvents = events.filter((p) => p.id !== id)
    setEvents(nextEvents)
    if (editingId === id) handleCancelEdit()
    void persistToServer({
      ...buildFile(),
      events: nextEvents,
    })
  }

  const handleDuplicate = (p: Protest) => {
    const copy: Protest = {
      ...p,
      id: `${p.id}-copy-${Date.now()}`,
      location: '',
    }
    loadEventIntoForm(copy)
    setEditingId(null)
  }

  const toggleTopic = (topic: ProtestTopicId) => {
    setForm((f) => ({
      ...f,
      topics: f.topics.includes(topic) ? f.topics.filter((t) => t !== topic) : [...f.topics, topic],
    }))
  }

  const handleDownload = () => {
    const json = serializeProtestsFile(buildFile())
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'protectont-events.txt'
    a.click()
    URL.revokeObjectURL(url)
    setLastUpdated(new Date().toISOString().slice(0, 10))
  }

  const handleLoadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        applyFile(parseProtestsFile(data))
        setSaveStatus('idle')
      } catch {
        alert(
          'We could not open that file. Choose the backup you downloaded from this page, or start fresh from the live site list.'
        )
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const inputClass =
    'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-900 font-light bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-shadow'

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <header className="bg-gradient-to-br from-slate-950 via-[#152a45] to-slate-900 text-white px-4 sm:px-6 md:px-8 py-10 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-blue-200/90 mb-2 font-medium">
                Events editor
              </p>
              <h1 className="text-2xl sm:text-3xl font-light tracking-tight">Manage events</h1>
              <p className="text-slate-300/95 font-light mt-2 max-w-lg text-sm sm:text-base">
                Add, edit, or remove protests shown on the public Events page.
              </p>
            </div>
            <Link
              href="/protests"
              className="inline-flex items-center gap-1.5 text-sm text-white/90 hover:text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-full px-4 py-2 transition-colors shrink-0"
            >
              View live page →
            </Link>
          </div>

          {loadStatus !== 'loading' && events.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8">
              <span className="inline-flex items-center rounded-full bg-white/10 border border-white/15 px-3 py-1 text-sm font-light">
                {events.length} total
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 px-3 py-1 text-sm font-light">
                {visibleCount} live on site
              </span>
              {needsDateFix > 0 && (
                <span className="inline-flex items-center rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-100 px-3 py-1 text-sm font-light">
                  {needsDateFix} need date fix
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10">
        {loadStatus === 'loading' && (
          <p className="text-slate-500 text-sm font-light mb-6 animate-pulse">Loading current events…</p>
        )}
        {loadStatus === 'error' && (
          <div className="text-amber-950 text-sm font-light mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="font-medium mb-1">Could not load the live event list</p>
            <p className="text-amber-900">
              Use <strong className="font-normal">Restore from backup</strong> below if you have a saved copy.
            </p>
          </div>
        )}

        {loadStatus === 'ok' && (
          <p className="text-sm text-slate-600 font-light mb-6">
            Anyone who can open this page can publish changes for all visitors on protectont.ca. Edit an event
            and tap <strong className="font-normal">Save</strong>.
          </p>
        )}

        {saveStatus === 'saving' && (
          <p className="text-sm text-slate-600 font-light mb-4">Publishing to the live site…</p>
        )}
        {saveStatus === 'saved' && (
          <p className="text-sm text-emerald-700 font-light mb-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            Saved — the public Events page is updated (refresh if you already have it open).
          </p>
        )}
        {saveStatus === 'error' && (
          <p className="text-sm text-red-700 font-light mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {saveError || 'Could not save. Try again or use Download backup.'}
          </p>
        )}

        <CollapsibleSection
          title="Announcement banner"
          subtitle="Optional message on the website and Events page"
          defaultOpen={false}
          accent="rose"
        >
          <div className="space-y-4 pt-2">
            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={featuredCampaign.enabled}
                onChange={(e) => setFeaturedCampaign((c) => ({ ...c, enabled: e.target.checked }))}
                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              Show announcement on the website
            </label>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Announcement text</label>
              <input
                type="text"
                value={featuredCampaign.label}
                onChange={(e) => setFeaturedCampaign((c) => ({ ...c, label: e.target.value }))}
                placeholder="e.g. Province-wide protest Saturday June 27, 2026 — find your city"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">List last updated</label>
              <input
                type="date"
                value={lastUpdated}
                onChange={(e) => setLastUpdated(e.target.value)}
                className={`${inputClass} max-w-xs`}
              />
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title={editingId ? 'Edit event' : 'Add a new event'}
          subtitle={editingId ? 'Update the fields below and save' : 'Tap + to expand the form'}
          open={addFormOpen || !!editingId}
          onOpenChange={setAddFormOpen}
          accent="blue"
        >
          <div className="space-y-4 pt-2">
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-sm text-slate-500 hover:text-slate-800 underline underline-offset-2"
              >
                Cancel editing
              </button>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Event name *
                </label>
                <input
                  id="title"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Fight Ford Protests (June 27)"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Date &amp; time
                </label>
                <input
                  id="date"
                  type="text"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  placeholder="June 27, 2026 · 1:00 PM"
                  className={`${inputClass} ${form.date && !isValidProtestDate(form.date) ? '!border-red-400 !ring-red-100' : ''}`}
                />
                {form.date && !isValidProtestDate(form.date) && (
                  <p className="text-xs text-red-600 mt-1.5">
                    Use &quot;June 27, 2026 · 1:00 PM&quot; or &quot;June 27, 2026&quot;.
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Status
                </label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProtestStatus }))}
                  className={inputClass}
                >
                  {PROTEST_STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1.5">
                  City
                </label>
                <input
                  id="location"
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="Toronto, ON"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Meeting place / address
                </label>
                <input
                  id="address"
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="organizer" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Organizer (optional)
                </label>
                <input
                  id="organizer"
                  type="text"
                  value={form.organizer}
                  onChange={(e) => setForm((f) => ({ ...f, organizer: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="campaignId" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Protest day group (optional)
                </label>
                <input
                  id="campaignId"
                  type="text"
                  value={form.campaignId}
                  onChange={(e) => setForm((f) => ({ ...f, campaignId: e.target.value }))}
                  placeholder="e.g. june-27-2026"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <span className="block text-sm font-medium text-slate-700 mb-2">Topics (optional)</span>
              <div className="flex flex-wrap gap-2">
                {PROTEST_TOPICS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTopic(t.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-light border transition-all ${
                      form.topics.includes(t.id)
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-800'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1.5">
                Short description
              </label>
              <textarea
                id="description"
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="link" className="block text-sm font-medium text-slate-700 mb-1.5">
                Link (optional)
              </label>
              <input
                id="link"
                type="url"
                value={form.link}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                placeholder="https://"
                className={inputClass}
              />
            </div>
            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Highlight near top of public list
            </label>
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-3.5 bg-gradient-to-r from-blue-700 to-blue-600 text-white text-sm font-medium rounded-xl hover:from-blue-800 hover:to-blue-700 transition-all shadow-md shadow-blue-600/25"
            >
              {editingId ? 'Save changes' : 'Add event'}
            </button>
          </div>
        </CollapsibleSection>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-900/5 overflow-hidden mb-6">
          <div className="px-5 py-4 sm:px-6 border-b border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium text-slate-900">Your events</h2>
              <p className="text-xs text-slate-500 font-light mt-0.5">Newest first · tap to edit</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  handleCancelEdit()
                  setAddFormOpen(true)
                }}
                className="text-sm py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-light transition-colors shadow-sm"
              >
                + Add event
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.txt,application/json"
                className="hidden"
                onChange={handleLoadFile}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm py-2 px-4 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 font-light transition-colors"
              >
                Restore backup
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={events.length === 0}
                className="text-sm py-2 px-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-40 font-light transition-colors shadow-sm"
              >
                Download backup
              </button>
            </div>
          </div>

          <div className="max-h-[32rem] overflow-y-auto">
            {sortedEvents.length === 0 ? (
              <p className="text-sm text-slate-500 py-12 text-center font-light px-4">
                No events yet — tap <strong className="font-normal">+ Add event</strong> above.
              </p>
            ) : (
              eventsByMonth.map((group) => (
                <section key={group.key}>
                  <div className="sticky top-0 z-10 px-4 sm:px-5 py-2.5 bg-slate-100/95 backdrop-blur-sm border-y border-slate-200/80">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                      {group.label}
                      <span className="font-normal text-slate-400 ml-2">({group.items.length})</span>
                    </p>
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {group.items.map((p) => {
                      const v = validation.find((x) => x.id === p.id)
                      const isEditing = editingId === p.id
                      const timePart = p.date.includes('·') ? p.date.split('·')[1]?.trim() : null
                      return (
                        <li
                          key={p.id}
                          className={`group transition-colors ${
                            isEditing ? 'bg-blue-50' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <div className="flex items-stretch">
                            <div
                              className={`w-1 shrink-0 ${
                                isEditing
                                  ? 'bg-blue-500'
                                  : p.featured
                                    ? 'bg-amber-400'
                                    : 'bg-slate-200 group-hover:bg-blue-300'
                              }`}
                            />
                            <div className="flex flex-1 items-start justify-between gap-3 py-4 px-4 sm:px-5 min-w-0">
                              <button
                                type="button"
                                onClick={() => loadEventIntoForm(p)}
                                className="min-w-0 text-left flex-1"
                              >
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  {timePart && (
                                    <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                                      {timePart}
                                    </span>
                                  )}
                                  {p.featured && (
                                    <span className="text-[10px] uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                                      Highlighted
                                    </span>
                                  )}
                                  {p.status && p.status !== 'confirmed' && (
                                    <span className="text-[10px] uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                      {p.status}
                                    </span>
                                  )}
                                </div>
                                <p className="font-medium text-slate-900 leading-snug">{p.title}</p>
                                <p className="text-sm text-slate-500 font-light mt-1">
                                  {p.location}
                                  {p.organizer ? ` · ${p.organizer}` : ''}
                                </p>
                                {!v?.dateOk && (
                                  <p className="text-xs text-red-600 mt-1">Check date format</p>
                                )}
                              </button>
                              <div className="flex flex-col gap-1.5 shrink-0 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleDuplicate(p)}
                                  className="text-xs text-blue-600 hover:text-blue-800 font-light px-2 py-1 rounded-lg hover:bg-blue-50"
                                >
                                  Copy
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemove(p.id)}
                                  className="text-xs text-red-600 hover:text-red-800 font-light px-2 py-1 rounded-lg hover:bg-red-50"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ))
            )}
          </div>
        </div>

        <p className="text-sm text-slate-500 font-light mb-6">
          Public event suggestions go through the{' '}
          <Link href="/about#contact" className="text-blue-600 underline underline-offset-2 hover:text-blue-700">
            contact form
          </Link>
          .
        </p>

        <p className="mt-4 text-center pb-8">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-800 font-light underline underline-offset-2">
            ← Back to homepage
          </Link>
        </p>
      </main>
    </div>
  )
}
