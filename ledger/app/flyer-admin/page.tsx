'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { getPublicDataFile } from '@/utils/dataPath'
import {
  defaultFlyersFile,
  parseFlyersFile,
  serializeFlyersFile,
  type Flyer,
  type FlyersFile,
  type FlyerSection,
} from '@/lib/flyers'
import { CollapsibleSection, TextField } from '../form-admin/FormFields'

function bulletsToText(bullets: string[]): string {
  return bullets.join('\n')
}

function textToBullets(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

function actionsToText(actions: Flyer['calloutActions']): string {
  return (actions ?? []).map((a) => `${a.label} | ${a.text}`).join('\n')
}

function textToActions(text: string): Flyer['calloutActions'] {
  return text
    .split('\n')
    .map((line) => {
      const pipe = line.indexOf('|')
      if (pipe === -1) return { label: line.trim(), text: '' }
      return {
        label: line.slice(0, pipe).trim(),
        text: line.slice(pipe + 1).trim(),
      }
    })
    .filter((a) => a.label || a.text)
}

function FlyerEditor({
  flyer,
  index,
  onChange,
  onRemove,
}: {
  flyer: Flyer
  index: number
  onChange: (next: Flyer) => void
  onRemove: () => void
}) {
  const updateSection = (sectionIndex: number, patch: Partial<FlyerSection>) => {
    const sections = flyer.sections.map((s, i) => (i === sectionIndex ? { ...s, ...patch } : s))
    onChange({ ...flyer, sections })
  }

  const addSection = () => {
    onChange({
      ...flyer,
      sections: [...flyer.sections, { title: 'New section', bullets: [''] }],
    })
  }

  const removeSection = (sectionIndex: number) => {
    onChange({ ...flyer, sections: flyer.sections.filter((_, i) => i !== sectionIndex) })
  }

  return (
    <CollapsibleSection
      title={`${flyer.title || 'Untitled'} ${flyer.subtitle}`.trim()}
      subtitle={`/flyer/${flyer.slug || '…'} · ${flyer.published ? 'Published' : 'Draft'}`}
      accent="violet"
      defaultOpen={index === 0}
    >
      <div className="flex flex-wrap gap-3 pb-2">
        <Link
          href={flyer.slug ? `/flyer/${flyer.slug}` : '#'}
          target="_blank"
          className="text-sm text-violet-700 underline hover:text-violet-900"
        >
          Preview flyer →
        </Link>
        <button
          type="button"
          onClick={onRemove}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Remove flyer
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={flyer.published}
          onChange={(e) => onChange({ ...flyer, published: e.target.checked })}
          className="rounded border-slate-300"
        />
        Published (visible on /flyer)
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Slug (URL)" value={flyer.slug} onChange={(slug) => onChange({ ...flyer, slug, id: slug })} hint="/flyer/your-slug" />
        <TextField label="ID" value={flyer.id} onChange={(id) => onChange({ ...flyer, id })} />
      </div>
      <TextField label="Headline (line 1)" value={flyer.title} onChange={(title) => onChange({ ...flyer, title })} />
      <TextField label="Headline (line 2)" value={flyer.subtitle} onChange={(subtitle) => onChange({ ...flyer, subtitle })} />
      <TextField label="Intro" value={flyer.intro} onChange={(intro) => onChange({ ...flyer, intro })} multiline rows={4} />

      <TextField
        label="Highlight tags (one per line)"
        value={bulletsToText(flyer.highlights)}
        onChange={(text) => onChange({ ...flyer, highlights: textToBullets(text) })}
        multiline
        rows={3}
        hint="Short bold labels under the headline — e.g. “Bill 60” or “Billions to agencies”"
      />

      <TextField
        label="Hero image URL"
        value={flyer.heroImageUrl}
        onChange={(heroImageUrl) => onChange({ ...flyer, heroImageUrl })}
        hint="Path like /products/yard-signs/ford-failed-you.png or full https:// URL. Leave blank for none."
      />
      {flyer.heroImageUrl && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={flyer.heroImageUrl} alt="Hero preview" className="max-h-40 object-contain mx-auto" />
        </div>
      )}

      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">Content sections</p>
          <button
            type="button"
            onClick={addSection}
            className="text-sm text-violet-700 hover:text-violet-900 font-medium"
          >
            + Add section
          </button>
        </div>
        {flyer.sections.map((section, si) => (
          <div key={si} className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
            <div className="flex justify-between items-start gap-2">
              <TextField
                label={`Section ${si + 1} title`}
                value={section.title}
                onChange={(title) => updateSection(si, { title })}
              />
              {flyer.sections.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSection(si)}
                  className="text-xs text-red-600 mt-6 shrink-0"
                >
                  Remove
                </button>
              )}
            </div>
            <TextField
              label="Section lead (optional paragraph)"
              value={section.lead ?? ''}
              onChange={(lead) => updateSection(si, { lead })}
              multiline
              rows={3}
            />
            <TextField
              label="Bullet points (one per line)"
              value={bulletsToText(section.bullets)}
              onChange={(text) => updateSection(si, { bullets: textToBullets(text) })}
              multiline
              rows={8}
            />
          </div>
        ))}
      </div>

      <TextField label="Callout title" value={flyer.calloutTitle} onChange={(calloutTitle) => onChange({ ...flyer, calloutTitle })} />
      <TextField
        label="Callout body (optional intro)"
        value={flyer.calloutBody}
        onChange={(calloutBody) => onChange({ ...flyer, calloutBody })}
        multiline
        rows={2}
      />
      <TextField
        label="Callout actions (one per line: Label | protectont.ca/path)"
        value={actionsToText(flyer.calloutActions)}
        onChange={(text) => onChange({ ...flyer, calloutActions: textToActions(text) })}
        multiline
        rows={4}
        hint="Shown as a grid of action cards under the callout title."
      />
    </CollapsibleSection>
  )
}

export default function FlyerAdminPage() {
  const [file, setFile] = useState<FlyersFile>(defaultFlyersFile())
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'published' | 'error'>('idle')
  const [publishMessage, setPublishMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch(getPublicDataFile('flyers.json'), { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (cancelled) return
        setFile(parseFlyersFile(data))
        setLoadStatus('ok')
      })
      .catch(() => {
        if (!cancelled) setLoadStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const updateFlyer = useCallback((index: number, next: Flyer) => {
    setFile((f) => ({
      ...f,
      flyers: f.flyers.map((flyer, i) => (i === index ? next : flyer)),
    }))
  }, [])

  const addFlyer = () => {
    const slug = `flyer-${Date.now()}`
    setFile((f) => ({
      ...f,
      flyers: [
        ...f.flyers,
        {
          id: slug,
          slug,
          title: 'New flyer:',
          subtitle: 'Subtitle here',
          intro: '',
          heroImageUrl: '',
          highlights: [],
          sections: [{ title: 'Key points', lead: '', bullets: ['First point'] }],
          calloutTitle: '',
          calloutBody: '',
          calloutActions: [],
          published: false,
        },
      ],
    }))
  }

  const removeFlyer = (index: number) => {
    if (!window.confirm('Remove this flyer?')) return
    setFile((f) => ({ ...f, flyers: f.flyers.filter((_, i) => i !== index) }))
  }

  const publish = async () => {
    setPublishStatus('publishing')
    setPublishMessage('')
    try {
      const res = await fetch('/api/protectont/flyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: serializeFlyersFile(file),
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

  const shared = file.shared

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white pb-20">
      <header className="bg-gradient-to-br from-violet-950 via-[#3d2b7a] to-slate-900 text-white px-4 sm:px-6 md:px-8 py-10 sm:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-violet-200/90 mb-2 font-medium">Flyer editor</p>
              <h1 className="text-2xl sm:text-3xl font-light tracking-tight">Printable flyers</h1>
              <p className="text-slate-300/95 font-light mt-2 max-w-lg text-sm sm:text-base">
                Edit text and images for issue flyers at <strong className="font-normal">/flyer</strong>, then publish.
              </p>
            </div>
            <Link
              href="/flyer"
              target="_blank"
              className="text-sm text-violet-200 hover:text-white underline underline-offset-4"
            >
              View /flyer →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10">
        {loadStatus === 'loading' && <p className="text-sm text-slate-500 font-light">Loading flyers…</p>}
        {loadStatus === 'error' && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            Could not load flyers.json — showing defaults. Publish will write to the server.
          </p>
        )}

        <CollapsibleSection title="Shared footer (all flyers)" subtitle="Header eyebrow, CTAs, fine print" accent="blue">
          <TextField
            label="Header eyebrow"
            value={shared.headerEyebrow}
            onChange={(headerEyebrow) => setFile((f) => ({ ...f, shared: { ...f.shared, headerEyebrow } }))}
          />
          <TextField
            label="Footer heading"
            value={shared.footerHeading}
            onChange={(footerHeading) => setFile((f) => ({ ...f, shared: { ...f.shared, footerHeading } }))}
          />
          <TextField
            label="Footer fine print"
            value={shared.footerFinePrint}
            onChange={(footerFinePrint) => setFile((f) => ({ ...f, shared: { ...f.shared, footerFinePrint } }))}
            multiline
            rows={3}
          />
          {shared.ctas.map((cta, i) => (
            <div key={i} className="grid gap-3 sm:grid-cols-2 rounded-lg border border-slate-200 p-3">
              <TextField
                label={`CTA ${i + 1} label`}
                value={cta.label}
                onChange={(label) => {
                  const ctas = shared.ctas.map((c, j) => (j === i ? { ...c, label } : c))
                  setFile((f) => ({ ...f, shared: { ...f.shared, ctas } }))
                }}
              />
              <TextField
                label={`CTA ${i + 1} text`}
                value={cta.text}
                onChange={(text) => {
                  const ctas = shared.ctas.map((c, j) => (j === i ? { ...c, text } : c))
                  setFile((f) => ({ ...f, shared: { ...f.shared, ctas } }))
                }}
              />
            </div>
          ))}
        </CollapsibleSection>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-slate-900">{file.flyers.length} flyers</h2>
          <button
            type="button"
            onClick={addFlyer}
            className="text-sm font-medium text-violet-700 hover:text-violet-900"
          >
            + Add flyer
          </button>
        </div>

        {file.flyers.map((flyer, index) => (
          <FlyerEditor
            key={`${flyer.id}-${index}`}
            flyer={flyer}
            index={index}
            onChange={(next) => updateFlyer(index, next)}
            onRemove={() => removeFlyer(index)}
          />
        ))}

        <div className="sticky bottom-4 mt-8 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur shadow-lg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={publish}
              disabled={publishStatus === 'publishing'}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#3d2b7a] text-white text-sm font-medium hover:bg-[#2a1f58] disabled:opacity-60 transition-colors"
            >
              {publishStatus === 'publishing' ? 'Publishing…' : 'Publish flyers'}
            </button>
            {publishStatus === 'published' && (
              <p className="mt-2 text-sm text-green-700">Published — live for all visitors.</p>
            )}
            {publishStatus === 'error' && <p className="mt-2 text-sm text-red-600">{publishMessage}</p>}
          </div>
          <p className="text-xs text-slate-500 font-light max-w-sm">
            New slugs need a site rebuild to get their own URL; existing slugs update immediately after publish.
          </p>
        </div>

        <p className="mt-8 text-center text-sm text-slate-500 font-light">
          <Link href="/form-admin" className="underline hover:text-slate-800">
            Join form editor
          </Link>
          {' · '}
          <Link href="/admin-events" className="underline hover:text-slate-800">
            Events editor
          </Link>
        </p>
      </main>
    </div>
  )
}
