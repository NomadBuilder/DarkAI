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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const applyFile = (file: ProtestsFile) => {
    setEvents(file.events)
    setLastUpdated(file.lastUpdated ?? '')
    if (file.featuredCampaign) {
      setFeaturedCampaign({
        enabled: file.featuredCampaign.enabled ?? false,
        label: file.featuredCampaign.label ?? '',
        href: file.featuredCampaign.href ?? '#event-list',
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

  const validation = useMemo(() => validateEvents(events), [events])
  const visibleCount = validation.filter((v) => v.visible).length
  const badDateCount = validation.filter((v) => !v.dateOk).length

  const buildFile = (): ProtestsFile => ({
    lastUpdated: lastUpdated || new Date().toISOString().slice(0, 10),
    featuredCampaign: featuredCampaign.label.trim()
      ? featuredCampaign
      : undefined,
    events,
  })

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
  }

  const handleSave = () => {
    if (!form.title.trim()) return
    const id = editingId ?? `${slugify(form.title)}-${slugify(form.date) || Date.now()}`
    const event = formToEvent(id)
    if (editingId) {
      setEvents((prev) => prev.map((p) => (p.id === editingId ? event : p)))
    } else {
      setEvents((prev) => [...prev, event])
    }
    setForm(emptyForm())
    setEditingId(null)
  }

  const handleCancelEdit = () => {
    setForm(emptyForm())
    setEditingId(null)
  }

  const handleRemove = (id: string) => {
    setEvents((prev) => prev.filter((p) => p.id !== id))
    if (editingId === id) handleCancelEdit()
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
    a.download = 'protests.json'
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
      } catch {
        alert('Invalid JSON file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-light text-gray-900">Update events &amp; rallies</h1>
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-700 font-light underline underline-offset-2"
          >
            ← Back to site
          </Link>
        </div>

        <p className="text-gray-500 text-sm font-light mb-6">
          Edit events, download JSON, replace <code className="bg-slate-200 px-1 rounded text-xs">ledger/public/data/protests.json</code>, then follow{' '}
          <code className="bg-slate-200 px-1 rounded text-xs">ledger/UPDATING_EVENTS.md</code>.
        </p>

        {loadStatus === 'loading' && (
          <p className="text-gray-500 text-sm font-light mb-6">Loading…</p>
        )}
        {loadStatus === 'error' && (
          <p className="text-amber-800 text-sm font-light mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            Could not load JSON. Use <strong className="font-normal">Load from file</strong>.
          </p>
        )}

        {events.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 text-sm font-light">
            <span className="text-gray-900">{events.length} events</span>
            <span className="text-slate-400 mx-2">·</span>
            <span className="text-emerald-700">{visibleCount} visible on site</span>
            {badDateCount > 0 && (
              <>
                <span className="text-slate-400 mx-2">·</span>
                <span className="text-red-600">{badDateCount} bad date (hidden)</span>
              </>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-light text-gray-900 mb-4">Site banner &amp; meta</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={featuredCampaign.enabled}
                onChange={(e) => setFeaturedCampaign((c) => ({ ...c, enabled: e.target.checked }))}
              />
              Show red nav banner
            </label>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banner text</label>
              <input
                type="text"
                value={featuredCampaign.label}
                onChange={(e) => setFeaturedCampaign((c) => ({ ...c, label: e.target.value }))}
                placeholder="e.g. Province-wide protests on May 30, 2026 — find your city"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-gray-900 font-light"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last updated (YYYY-MM-DD)</label>
              <input
                type="text"
                value={lastUpdated}
                onChange={(e) => setLastUpdated(e.target.value)}
                placeholder={new Date().toISOString().slice(0, 10)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-gray-900 font-light"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-light text-gray-900 mb-1">
            {editingId ? 'Edit event' : 'Add event'}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-sm text-slate-500 hover:text-slate-700 mb-4 underline underline-offset-2"
            >
              Cancel edit
            </button>
          )}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  id="title"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-gray-900 font-light"
                />
              </div>
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date &amp; time</label>
                <input
                  id="date"
                  type="text"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  placeholder="May 30, 2026 · 2:00 PM"
                  className={`w-full px-3 py-2 border rounded-lg text-gray-900 font-light ${
                    form.date && !isValidProtestDate(form.date) ? 'border-red-400' : 'border-slate-300'
                  }`}
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProtestStatus }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-gray-900 font-light"
                >
                  {PROTEST_STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">City / location</label>
                <input
                  id="location"
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="Toronto, ON"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-gray-900 font-light"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Street address (optional)</label>
                <input
                  id="address"
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Queen's Park, Toronto"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-gray-900 font-light"
                />
              </div>
              <div>
                <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-1">Organizer</label>
                <input
                  id="organizer"
                  type="text"
                  value={form.organizer}
                  onChange={(e) => setForm((f) => ({ ...f, organizer: e.target.value }))}
                  placeholder="CUPE Ontario"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-gray-900 font-light"
                />
              </div>
              <div>
                <label htmlFor="campaignId" className="block text-sm font-medium text-gray-700 mb-1">Campaign ID</label>
                <input
                  id="campaignId"
                  type="text"
                  value={form.campaignId}
                  onChange={(e) => setForm((f) => ({ ...f, campaignId: e.target.value }))}
                  placeholder="may-30-2026"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-gray-900 font-light"
                />
              </div>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-2">Topics</span>
              <div className="flex flex-wrap gap-2">
                {PROTEST_TOPICS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTopic(t.id)}
                    className={`px-3 py-1 rounded-full text-sm font-light border transition-colors ${
                      form.topics.includes(t.id)
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-gray-600 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                id="description"
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-gray-900 font-light"
              />
            </div>
            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">Event link</label>
              <input
                id="link"
                type="url"
                value={form.link}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-gray-900 font-light"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
              />
              Featured (pin in event list)
            </label>
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-3 bg-slate-900 text-white text-sm font-light rounded-lg hover:bg-slate-800 transition-colors"
            >
              {editingId ? 'Save changes' : 'Add to list'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h2 className="text-lg font-light text-gray-900">Events ({events.length})</h2>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleLoadFile} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-blue-600 hover:text-blue-700 font-light underline underline-offset-2"
            >
              Load from file
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={events.length === 0}
              className="text-sm py-2 px-4 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 font-light"
            >
              Download protests.json
            </button>
          </div>
          <ul className="space-y-2 max-h-[32rem] overflow-y-auto">
            {events.map((p) => {
              const v = validation.find((x) => x.id === p.id)
              return (
                <li
                  key={p.id}
                  className={`flex items-start justify-between gap-3 py-3 border-b border-slate-100 last:border-0 ${
                    editingId === p.id ? 'bg-blue-50/50 -mx-2 px-2 rounded' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => loadEventIntoForm(p)}
                    className="min-w-0 text-left flex-1"
                  >
                    <p className="font-medium text-gray-900">{p.title}</p>
                    <p className="text-sm text-gray-500">
                      {p.date} · {p.location}
                      {p.organizer ? ` · ${p.organizer}` : ''}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {!v?.dateOk && <span className="text-red-600">Bad date · </span>}
                      {p.status && p.status !== 'confirmed' && <span>{p.status} · </span>}
                      {p.topics?.join(', ')}
                    </p>
                  </button>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDuplicate(p)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-light"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(p.id)}
                      className="text-xs text-red-600 hover:text-red-800 font-light"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
