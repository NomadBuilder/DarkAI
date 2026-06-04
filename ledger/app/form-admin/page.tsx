'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getPublicDataFile } from '../../utils/dataPath'
import {
  defaultGetInvolvedFormCopy,
  parseGetInvolvedFormCopy,
  serializeGetInvolvedFormCopy,
  type FormRoleCopy,
  type GetInvolvedFormCopy,
} from '../../lib/get-involved-form-config'

const inputClass =
  'w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-light focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-400'
const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5'

function RoleEditor({
  role,
  index,
  onChange,
}: {
  role: FormRoleCopy
  index: number
  onChange: (next: FormRoleCopy) => void
}) {
  const titles = ['Sign request', 'Pickup hub', 'Volunteer', 'Other']
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Option {index + 1} · {titles[index] ?? role.id}
      </p>
      <div>
        <label className={labelClass}>Title</label>
        <input
          type="text"
          value={role.label}
          onChange={(e) => onChange({ ...role, label: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          rows={2}
          value={role.description}
          onChange={(e) => onChange({ ...role, description: e.target.value })}
          className={`${inputClass} resize-y`}
        />
      </div>
    </div>
  )
}

export default function FormAdminPage() {
  const [copy, setCopy] = useState<GetInvolvedFormCopy>(defaultGetInvolvedFormCopy())
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'published' | 'error'>('idle')
  const [publishMessage, setPublishMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch(getPublicDataFile('get-involved-form.json'), { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (cancelled) return
        setCopy(parseGetInvolvedFormCopy(data))
        setLoadStatus('ok')
      })
      .catch(() => {
        if (!cancelled) setLoadStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const updateRole = (index: number, next: FormRoleCopy) => {
    setCopy((c) => ({
      ...c,
      roles: c.roles.map((r, i) => (i === index ? next : r)),
    }))
  }

  const publish = async () => {
    setPublishStatus('publishing')
    setPublishMessage('')
    try {
      const res = await fetch('/api/protectont/get-involved-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: serializeGetInvolvedFormCopy(copy),
      })
      const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string }
      if (!res.ok) {
        setPublishStatus('error')
        setPublishMessage(body.error || body.message || `Publish failed (${res.status})`)
        return
      }
      setPublishStatus('published')
    } catch {
      setPublishStatus('error')
      setPublishMessage('Network error — could not reach the server.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      <header className="bg-gradient-to-br from-violet-950 via-[#3d2b7a] to-slate-900 text-white px-4 sm:px-6 md:px-8 py-10 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-violet-200/90 mb-2 font-medium">
                Join form editor
              </p>
              <h1 className="text-2xl sm:text-3xl font-light tracking-tight">Form copy</h1>
              <p className="text-slate-300/95 font-light mt-2 max-w-lg text-sm sm:text-base">
                Edit the sign-up form on <strong className="font-normal">/join</strong>. When you are done, tap{' '}
                <strong className="font-normal">Publish</strong> — everyone sees the new wording immediately.
              </p>
            </div>
            <Link
              href="/join"
              className="inline-flex items-center gap-1.5 text-sm text-white/90 hover:text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-full px-4 py-2 transition-colors shrink-0"
            >
              View live form →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 pb-28">
        {loadStatus === 'loading' && (
          <p className="text-slate-500 text-sm font-light mb-6 animate-pulse">Loading current form copy…</p>
        )}
        {loadStatus === 'error' && (
          <div className="text-amber-950 text-sm font-light mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="font-medium mb-1">Could not load saved copy</p>
            <p className="text-amber-900">Using defaults below — publish to create the live JSON file.</p>
          </div>
        )}

        {loadStatus === 'ok' && (
          <p className="text-sm text-slate-600 font-light mb-6">
            Changes apply to <strong className="font-normal">everyone</strong> on the join form after you publish.
          </p>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-6 shadow-sm space-y-4">
          <h2 className="text-lg font-medium text-slate-900">Main question</h2>
          <div>
            <label className={labelClass}>Question label</label>
            <input
              type="text"
              value={copy.rolesQuestion}
              onChange={(e) => setCopy((c) => ({ ...c, rolesQuestion: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Submit button</label>
            <input
              type="text"
              value={copy.submitButton}
              onChange={(e) => setCopy((c) => ({ ...c, submitButton: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Footer text (before link)</label>
              <input
                type="text"
                value={copy.footerPrefix}
                onChange={(e) => setCopy((c) => ({ ...c, footerPrefix: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Footer link label</label>
              <input
                type="text"
                value={copy.footerLinkLabel}
                onChange={(e) => setCopy((c) => ({ ...c, footerLinkLabel: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-violet-200 bg-violet-50/30 p-5 mb-6 shadow-sm">
          <h2 className="text-lg font-medium text-slate-900 mb-1">Preview</h2>
          <p className="text-xs text-slate-500 font-light mb-4">How options appear on /join</p>
          <fieldset className="space-y-3">
            <legend className="text-sm text-slate-700 mb-2">{copy.rolesQuestion}</legend>
            {copy.roles.map((role) => (
              <div
                key={role.id}
                className="flex gap-3 p-4 rounded-xl border border-gray-200 bg-white"
              >
                <span className="mt-1 h-4 w-4 rounded-full border border-gray-300 shrink-0" aria-hidden />
                <span>
                  <span className="block text-sm font-medium text-gray-900">{role.label || '—'}</span>
                  <span className="block text-sm text-gray-600 font-light mt-0.5">
                    {role.description || '—'}
                  </span>
                </span>
              </div>
            ))}
          </fieldset>
          <button
            type="button"
            disabled
            className="mt-4 w-full py-3 rounded-xl bg-[#3d2b7a] text-[#f9e04c] text-sm font-semibold opacity-90"
          >
            {copy.submitButton}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-6 shadow-sm space-y-4">
          <h2 className="text-lg font-medium text-slate-900">Involvement options</h2>
          {copy.roles.map((role, i) => (
            <RoleEditor key={role.id} role={role} index={i} onChange={(next) => updateRole(i, next)} />
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-6 shadow-sm space-y-4">
          <h2 className="text-lg font-medium text-slate-900">After submit & consent</h2>
          <div>
            <label className={labelClass}>Thank-you title</label>
            <input
              type="text"
              value={copy.successTitle}
              onChange={(e) => setCopy((c) => ({ ...c, successTitle: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Thank-you message</label>
            <textarea
              rows={3}
              value={copy.successBody}
              onChange={(e) => setCopy((c) => ({ ...c, successBody: e.target.value }))}
              className={`${inputClass} resize-y`}
            />
          </div>
          <div>
            <label className={labelClass}>Consent checkbox text</label>
            <textarea
              rows={3}
              value={copy.consentText}
              onChange={(e) => setCopy((c) => ({ ...c, consentText: e.target.value }))}
              className={`${inputClass} resize-y`}
            />
          </div>
        </div>

        {publishStatus === 'published' && (
          <p className="text-sm text-emerald-700 font-light mb-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            Published — <strong className="font-normal">/join</strong> is live for all visitors. Sign-ups still go to
            the sheet as before; only the wording changed.
          </p>
        )}
        {publishStatus === 'error' && (
          <p className="text-sm text-red-700 font-light mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {publishMessage || 'Could not publish.'}
          </p>
        )}

        <p className="mt-4 text-center pb-4">
          <Link
            href="/admin-events"
            className="text-sm text-slate-500 hover:text-slate-800 font-light underline underline-offset-2"
          >
            Manage events →
          </Link>
          <span className="text-slate-300 mx-2">·</span>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-800 font-light underline underline-offset-2">
            Homepage
          </Link>
        </p>
      </main>

      <div className="fixed bottom-0 inset-x-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur-sm px-4 py-4 safe-area-pb">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500 font-light sm:max-w-md">
            Publish updates the live site. To keep copy after the next deploy, also commit{' '}
            <code className="text-slate-600">static/protectont/data/get-involved-form.json</code> and push to{' '}
            <code className="text-slate-600">main</code> from your repo (same as other ProtectOnt updates).
          </p>
          <button
            type="button"
            onClick={() => void publish()}
            disabled={publishStatus === 'publishing' || loadStatus === 'loading'}
            className="shrink-0 px-6 py-3.5 bg-gradient-to-r from-violet-700 to-[#3d2b7a] text-white text-sm font-medium rounded-xl hover:from-violet-800 hover:to-[#2f2260] transition-all shadow-md shadow-violet-900/20 disabled:opacity-50"
          >
            {publishStatus === 'publishing' ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  )
}
