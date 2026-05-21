'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { getPublicDataFile } from '../../utils/dataPath'
import type { Protest } from '../../data/protests'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

const emptyForm = {
  title: '',
  date: '',
  location: '',
  description: '',
  link: '',
}

export default function AdminEventsPage() {
  const [list, setList] = useState<Protest[]>([])
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ok' | 'empty' | 'error'>('loading')
  const [form, setForm] = useState(emptyForm)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false
    fetch(getPublicDataFile('protests.json'), { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (cancelled) return
        const parsed = Array.isArray(data) ? (data as Protest[]) : []
        setList(parsed)
        setLoadStatus(parsed.length > 0 ? 'ok' : 'empty')
      })
      .catch(() => {
        if (!cancelled) setLoadStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleAdd = () => {
    if (!form.title.trim()) return
    const id = `${slugify(form.title)}-${slugify(form.date) || Date.now()}`
    setList((prev) => [
      ...prev,
      {
        id,
        title: form.title.trim(),
        date: form.date.trim() || 'TBD',
        location: form.location.trim() || 'TBD',
        description: form.description.trim() || undefined,
        link: form.link.trim() || undefined,
      },
    ])
    setForm(emptyForm)
  }

  const handleRemove = (id: string) => {
    setList((prev) => prev.filter((p) => p.id !== id))
  }

  const handleDownload = () => {
    const json = JSON.stringify(list, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'protests.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleLoadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        const parsed = Array.isArray(data) ? data : []
        if (parsed.length > 0 && typeof parsed[0] === 'object' && 'title' in parsed[0]) {
          setList(parsed as Protest[])
          setLoadStatus('ok')
        }
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

        <p className="text-gray-500 text-sm font-light mb-8">
          Edit the event list, download JSON, then follow <code className="bg-slate-200 px-1 rounded text-xs">ledger/UPDATING_EVENTS.md</code> to publish.
          Dates: <code className="bg-slate-200 px-1 rounded text-xs">May 30, 2026 · 2:00 PM</code>
        </p>

        {loadStatus === 'loading' && (
          <p className="text-gray-500 text-sm font-light mb-6">Loading current events from /data/protests.json…</p>
        )}
        {loadStatus === 'error' && (
          <p className="text-amber-800 text-sm font-light mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            Could not load live JSON. Use <strong className="font-normal">Load from file</strong> with the copy in{' '}
            <code className="bg-amber-100 px-1 rounded">ledger/public/data/protests.json</code>.
          </p>
        )}

        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-light text-gray-900 mb-4">Add an event</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Rally for Public Healthcare"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-gray-900 font-light"
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date &amp; time
              </label>
              <input
                id="date"
                type="text"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                placeholder="e.g. May 30, 2026 · 2:00 PM"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-gray-900 font-light"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                id="location"
                type="text"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Queen's Park, Toronto"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-gray-900 font-light"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Short description (organizer, focus, etc.)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-gray-900 font-light"
              />
            </div>
            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
                Event link (optional)
              </label>
              <input
                id="link"
                type="url"
                value={form.link}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-gray-900 font-light"
              />
            </div>
            <button
              type="button"
              onClick={handleAdd}
              className="w-full py-3 bg-slate-900 text-white text-sm font-light rounded-lg hover:bg-slate-800 transition-colors"
            >
              Add to list
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h2 className="text-lg font-light text-gray-900">Event list ({list.length})</h2>
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
              disabled={list.length === 0}
              className="text-sm py-2 px-4 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed font-light"
            >
              Download protests.json
            </button>
          </div>
          {list.length === 0 ? (
            <p className="text-gray-500 text-sm font-light">No events yet. Add one above or load a JSON file.</p>
          ) : (
            <ul className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
              {list.map((p) => (
                <li
                  key={p.id}
                  className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{p.title}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {p.date} · {p.location}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(p.id)}
                    className="text-sm text-red-600 hover:text-red-700 font-light shrink-0"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
