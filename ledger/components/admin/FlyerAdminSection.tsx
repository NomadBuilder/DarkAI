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
import {
  DEFAULT_FLYER_THEME,
  resolveFlyerTheme,
  slugifyFlyerTitle,
  uniqueFlyerSlug,
  type FlyerTheme,
} from '@/lib/flyer-theme'
import { CollapsibleSection, ColorField, TextField, inputClass, labelClass } from '@/app/form-admin/FormFields'

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

const BLANK_FLYER_DRAFT = {
  title: '',
  subtitle: '',
  copyFromSlug: '',
}

function blankFlyerTemplate(title: string, subtitle: string, slug: string): Flyer {
  return {
    id: slug,
    slug,
    title: title.trim() || 'New flyer headline',
    subtitle: subtitle.trim() || 'Second line here',
    intro: '',
    heroImageUrl: '',
    highlights: [],
    sections: [{ title: 'Key points', lead: '', bullets: ['First point'] }],
    calloutTitle: '',
    calloutBody: '',
    calloutActions: [],
    published: false,
  }
}

function duplicateFlyerAsNew(source: Flyer, title: string, subtitle: string, slug: string): Flyer {
  const copy = JSON.parse(JSON.stringify(source)) as Flyer
  return {
    ...copy,
    id: slug,
    slug,
    title: title.trim() || `${source.title} (copy)`,
    subtitle: subtitle.trim() || source.subtitle,
    published: false,
  }
}

function buildNewFlyer(
  file: FlyersFile,
  draft: { title: string; subtitle: string; copyFromSlug: string }
): Flyer {
  const existing = file.flyers.map((flyer) => flyer.slug)
  const slug = uniqueFlyerSlug(slugifyFlyerTitle(draft.title || 'new-flyer'), existing)
  if (draft.copyFromSlug) {
    const source = file.flyers.find((f) => f.slug === draft.copyFromSlug)
    if (source) return duplicateFlyerAsNew(source, draft.title, draft.subtitle, slug)
  }
  return blankFlyerTemplate(draft.title, draft.subtitle, slug)
}

function FlyerThemeEditor({
  theme,
  onChange,
  onReset,
}: {
  theme: Partial<FlyerTheme> | undefined
  onChange: (next: Partial<FlyerTheme>) => void
  onReset: () => void
}) {
  const resolved = resolveFlyerTheme(theme)
  const set = (key: keyof FlyerTheme, value: string) => {
    onChange({ ...theme, [key]: value })
  }

  return (
    <div className="space-y-5 rounded-xl border border-violet-100 bg-violet-50/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-800">Colors &amp; backgrounds</p>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-violet-700 hover:text-violet-900 font-medium"
        >
          Reset to defaults
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ColorField
          label="Header background (top)"
          value={resolved.headerColorTop}
          onChange={(v) => set('headerColorTop', v)}
          hint="Top of the purple header band"
        />
        <ColorField
          label="Header background (bottom)"
          value={resolved.headerColorBottom}
          onChange={(v) => set('headerColorBottom', v)}
          hint="Bottom of the header gradient"
        />
        <ColorField
          label="Footer background (top)"
          value={resolved.footerColorTop}
          onChange={(v) => set('footerColorTop', v)}
        />
        <ColorField
          label="Footer background (bottom)"
          value={resolved.footerColorBottom}
          onChange={(v) => set('footerColorBottom', v)}
        />
        <ColorField
          label="Body background"
          value={resolved.bodyBackground}
          onChange={(v) => set('bodyBackground', v)}
          hint="Main white area behind sections"
        />
        <ColorField
          label="Callout background"
          value={resolved.calloutBackground}
          onChange={(v) => set('calloutBackground', v)}
          allowAlpha
          hint="Supports rgba for transparency"
        />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 pt-1">Brand &amp; accents</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <ColorField
          label="Primary (purple)"
          value={resolved.primaryColor}
          onChange={(v) => set('primaryColor', v)}
          hint="Section titles, borders"
        />
        <ColorField
          label="Accent (red)"
          value={resolved.accentColor}
          onChange={(v) => set('accentColor', v)}
          hint="Stripe, bullet dots"
        />
        <ColorField
          label="Highlight (yellow)"
          value={resolved.highlightColor}
          onChange={(v) => set('highlightColor', v)}
          hint="Tags, eyebrows"
        />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 pt-1">Text colors</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <ColorField label="Headline" value={resolved.headlineColor} onChange={(v) => set('headlineColor', v)} />
        <ColorField label="Subtitle" value={resolved.subtitleColor} onChange={(v) => set('subtitleColor', v)} />
        <ColorField label="Intro paragraph" value={resolved.introColor} onChange={(v) => set('introColor', v)} />
        <ColorField
          label="Section titles"
          value={resolved.sectionTitleColor}
          onChange={(v) => set('sectionTitleColor', v)}
        />
        <ColorField label="Body text" value={resolved.bodyTextColor} onChange={(v) => set('bodyTextColor', v)} />
        <ColorField
          label="Highlight tag text"
          value={resolved.highlightTagTextColor}
          onChange={(v) => set('highlightTagTextColor', v)}
        />
        <ColorField
          label="Callout title"
          value={resolved.calloutTitleColor}
          onChange={(v) => set('calloutTitleColor', v)}
        />
        <ColorField
          label="Footer heading"
          value={resolved.footerHeadingColor}
          onChange={(v) => set('footerHeadingColor', v)}
        />
        <ColorField
          label="Footer link text"
          value={resolved.footerCtaTextColor}
          onChange={(v) => set('footerCtaTextColor', v)}
        />
      </div>

      <p className="text-xs text-slate-500 font-light">
        Defaults: primary {DEFAULT_FLYER_THEME.primaryColor}, accent {DEFAULT_FLYER_THEME.accentColor},{' '}
        highlight {DEFAULT_FLYER_THEME.highlightColor}. Leave unchanged to keep the standard ProtectOnt look.
      </p>
    </div>
  )
}

function FlyerEditor({
  flyer,
  index,
  open,
  onOpenChange,
  onChange,
  onRemove,
  onDuplicate,
}: {
  flyer: Flyer
  index: number
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onChange: (next: Flyer) => void
  onRemove: () => void
  onDuplicate: () => void
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
      title={`${flyer.title || 'Untitled'}${flyer.subtitle ? ` — ${flyer.subtitle}` : ''}`}
      subtitle={flyer.published ? 'Published · visible on the flyers page' : 'Draft · hidden from visitors'}
      accent="violet"
      open={open}
      onOpenChange={onOpenChange}
      defaultOpen={index === 0}
    >
      <div className="flex flex-wrap items-center gap-3 pb-2">
        {flyer.slug && flyer.published && (
          <Link
            href={`/flyer/${flyer.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-100 px-3 py-1.5 text-sm font-medium text-violet-800 hover:bg-violet-200 transition-colors"
          >
            Open preview ↗
          </Link>
        )}
        {flyer.slug && !flyer.published && (
          <span className="text-sm text-slate-500 font-light">
            Publish this flyer to enable preview.
          </span>
        )}
        <button
          type="button"
          onClick={onDuplicate}
          className="text-sm text-violet-700 hover:text-violet-900 font-medium"
        >
          Duplicate as new
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="text-sm text-red-600 hover:text-red-800 ml-auto"
        >
          Delete flyer
        </button>
      </div>

      <label className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 cursor-pointer">
        <input
          type="checkbox"
          checked={flyer.published}
          onChange={(e) => onChange({ ...flyer, published: e.target.checked })}
          className="rounded border-slate-300 text-violet-600 focus:ring-violet-500"
        />
        <span>
          <span className="font-medium">Published</span>
          <span className="block text-xs text-slate-500 font-light mt-0.5">
            Show on the public flyers list and allow printing
          </span>
        </span>
      </label>

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 pt-1">Headlines</p>
      <TextField label="Main headline" value={flyer.title} onChange={(title) => onChange({ ...flyer, title })} />
      <TextField label="Second line" value={flyer.subtitle} onChange={(subtitle) => onChange({ ...flyer, subtitle })} />
      <TextField label="Intro paragraph" value={flyer.intro} onChange={(intro) => onChange({ ...flyer, intro })} multiline rows={4} />

      <TextField
        label="Key tags (one per line)"
        value={bulletsToText(flyer.highlights)}
        onChange={(text) => onChange({ ...flyer, highlights: textToBullets(text) })}
        multiline
        rows={3}
        hint='Short bold labels under the headline — e.g. "Bill 60" or "Billions to agencies"'
      />

      <CollapsibleSection title="Look & colors" subtitle="Backgrounds, accents, and text colors" accent="blue" defaultOpen={false}>
        <FlyerThemeEditor
          theme={flyer.theme}
          onChange={(theme) => onChange({ ...flyer, theme })}
          onReset={() => {
            const { theme: _removed, ...rest } = flyer
            onChange(rest)
          }}
        />
      </CollapsibleSection>

      <TextField
        label="Header image"
        value={flyer.heroImageUrl}
        onChange={(heroImageUrl) => onChange({ ...flyer, heroImageUrl })}
        hint="Upload to the site or use a path like /products/yard-signs/ford-failed-you.png. Leave blank for text-only."
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
        label="Action links (one per line: Label | protectont.ca/path)"
        value={actionsToText(flyer.calloutActions)}
        onChange={(text) => onChange({ ...flyer, calloutActions: textToActions(text) })}
        multiline
        rows={4}
        hint="Shown as a grid of cards under the callout."
      />
    </CollapsibleSection>
  )
}

export default function FlyerAdminPage({ embedded = false }: { embedded?: boolean }) {
  const [file, setFile] = useState<FlyersFile>(defaultFlyersFile())
  const [loadStatus, setLoadStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [publishStatus, setPublishStatus] = useState<'idle' | 'publishing' | 'published' | 'error'>('idle')
  const [publishMessage, setPublishMessage] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [createDraft, setCreateDraft] = useState(BLANK_FLYER_DRAFT)
  const [expandedFlyerIndex, setExpandedFlyerIndex] = useState<number | null>(null)

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

  const addFlyer = (draft = createDraft) => {
    let newIndex = 0
    setFile((f) => {
      const flyer = buildNewFlyer(f, draft)
      newIndex = f.flyers.length
      return { ...f, flyers: [...f.flyers, flyer] }
    })
    setExpandedFlyerIndex(newIndex)
    setCreateOpen(false)
    setCreateDraft(BLANK_FLYER_DRAFT)
    window.setTimeout(() => {
      document.getElementById(`flyer-editor-${newIndex}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const duplicateFlyer = (index: number) => {
    const source = file.flyers[index]
    if (!source) return
    let newIndex = 0
    setFile((f) => {
      const flyer = buildNewFlyer(f, {
        title: `${source.title} (copy)`,
        subtitle: source.subtitle,
        copyFromSlug: source.slug,
      })
      newIndex = f.flyers.length
      return { ...f, flyers: [...f.flyers, flyer] }
    })
    setExpandedFlyerIndex(newIndex)
    window.setTimeout(() => {
      document.getElementById(`flyer-editor-${newIndex}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const removeFlyer = (index: number) => {
    if (!window.confirm('Remove this flyer?')) return
    setFile((f) => ({ ...f, flyers: f.flyers.filter((_, i) => i !== index) }))
    setExpandedFlyerIndex((current) => {
      if (current === null) return null
      if (current === index) return null
      if (current > index) return current - 1
      return current
    })
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

  const main = (
      <main className={embedded ? 'pb-8' : 'max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 pb-20'}>
        {loadStatus === 'loading' && <p className="text-sm text-slate-500 font-light">Loading flyers…</p>}
        {loadStatus === 'error' && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            Could not load flyers.json — showing defaults. Publish will write to the server.
          </p>
        )}

        <CollapsibleSection title="Shared footer (all flyers)" subtitle="CTAs and fine print" accent="blue">
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

        <CollapsibleSection
          title="Create new flyer"
          subtitle="Start blank or copy an existing flyer as a template"
          accent="blue"
          open={createOpen}
          onOpenChange={setCreateOpen}
        >
          <div className="space-y-4 pt-1">
            <TextField
              label="Main headline"
              value={createDraft.title}
              onChange={(title) => setCreateDraft((d) => ({ ...d, title }))}
              hint="Required — this becomes the flyer title"
            />
            <TextField
              label="Second line"
              value={createDraft.subtitle}
              onChange={(subtitle) => setCreateDraft((d) => ({ ...d, subtitle }))}
            />
            <div>
              <label className={labelClass}>Start from</label>
              <p className="text-xs text-slate-500 font-light mb-1.5">
                Blank starts with one section. Copy keeps text, colors, and layout from another flyer.
              </p>
              <select
                value={createDraft.copyFromSlug}
                onChange={(e) => setCreateDraft((d) => ({ ...d, copyFromSlug: e.target.value }))}
                className={inputClass}
              >
                <option value="">Blank flyer</option>
                {file.flyers.map((flyer) => (
                  <option key={flyer.slug} value={flyer.slug}>
                    Copy from: {flyer.title || 'Untitled'}
                    {flyer.subtitle ? ` — ${flyer.subtitle}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => addFlyer()}
              disabled={!createDraft.title.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#3d2b7a] text-white text-sm font-medium hover:bg-[#2a1f58] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Create flyer
            </button>
            {!createDraft.title.trim() && (
              <p className="text-xs text-slate-500 font-light">Enter a headline to create the flyer.</p>
            )}
          </div>
        </CollapsibleSection>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-medium text-slate-900">{file.flyers.length} flyers</h2>
            <p className="text-xs text-slate-500 font-light mt-0.5">Tap a flyer to edit · new flyers start as drafts</p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 hover:bg-violet-200 border border-violet-200 px-4 py-2 text-sm font-medium text-violet-900 transition-colors"
          >
            + Create flyer
          </button>
        </div>

        {file.flyers.length === 0 && (
          <p className="text-sm text-slate-600 font-light mb-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
            No flyers yet — use <strong className="font-normal">Create new flyer</strong> above to add your first one.
          </p>
        )}

        {file.flyers.map((flyer, index) => (
          <div key={`${flyer.id}-${index}`} id={`flyer-editor-${index}`}>
            <FlyerEditor
              flyer={flyer}
              index={index}
              open={expandedFlyerIndex === index ? true : expandedFlyerIndex === null ? undefined : false}
              onOpenChange={(open) => {
                if (open) setExpandedFlyerIndex(index)
                else if (expandedFlyerIndex === index) setExpandedFlyerIndex(null)
              }}
              onChange={(next) => updateFlyer(index, next)}
              onRemove={() => removeFlyer(index)}
              onDuplicate={() => duplicateFlyer(index)}
            />
          </div>
        ))}

        {file.flyers.length > 0 && (
          <div className="flex justify-center pb-4">
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="text-sm font-medium text-violet-700 hover:text-violet-900"
            >
              + Create another flyer
            </button>
          </div>
        )}

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
            Changes go live after publish. Brand-new flyers may need a site update before their preview link works.
          </p>
        </div>

        {!embedded && (
          <p className="mt-8 text-center text-sm text-slate-500 font-light">
            <Link href="/admin?section=join-form" className="underline hover:text-slate-800">
              Join form editor
            </Link>
            {' · '}
            <Link href="/admin?section=events" className="underline hover:text-slate-800">
              Events editor
            </Link>
            {' · '}
            <Link href="/admin" className="underline hover:text-slate-800">
              All admin
            </Link>
          </p>
        )}
      </main>
  )

  if (embedded) {
    return main
  }

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

      {main}
    </div>
  )
}
