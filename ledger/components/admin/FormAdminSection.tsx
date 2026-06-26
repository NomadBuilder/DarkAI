'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getPublicDataFile } from '@/utils/dataPath'
import {
  defaultGetInvolvedFormCopy,
  parseGetInvolvedFormCopy,
  serializeGetInvolvedFormCopy,
  type FormRoleCopy,
  type GetInvolvedFormCopy,
} from '@/lib/get-involved-form-config'
import { CollapsibleSection, SelectOptionsEditor, TextField } from '@/app/form-admin/FormFields'
import RichTextField from '@/app/form-admin/RichTextField'

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
      <TextField label="Title" value={role.label} onChange={(label) => onChange({ ...role, label })} />
      <TextField
        label="Description"
        value={role.description}
        onChange={(description) => onChange({ ...role, description })}
        multiline
      />
    </div>
  )
}

function patchCopy<K extends keyof GetInvolvedFormCopy>(
  setCopy: React.Dispatch<React.SetStateAction<GetInvolvedFormCopy>>,
  key: K,
  value: GetInvolvedFormCopy[K]
) {
  setCopy((c) => ({ ...c, [key]: value }))
}

function patchNested<
  K extends 'contact' | 'yardSign' | 'dropoff' | 'volunteer' | 'other' | 'shared' | 'successYardSign' | 'validation' | 'errors',
>(
  setCopy: React.Dispatch<React.SetStateAction<GetInvolvedFormCopy>>,
  key: K,
  patch: Partial<GetInvolvedFormCopy[K]>
) {
  setCopy((c) => ({ ...c, [key]: { ...c[key], ...patch } }))
}

export default function FormAdminPage({ embedded = false }: { embedded?: boolean }) {
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

  const ys = copy.yardSign

  const main = (
      <main className={embedded ? 'pb-28' : 'max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 pb-28'}>
        {loadStatus === 'loading' && (
          <p className="text-slate-500 text-sm font-light mb-6 animate-pulse">Loading current form copy…</p>
        )}
        {loadStatus === 'error' && (
          <div className="text-amber-950 text-sm font-light mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
            Could not load saved copy — defaults below. Publish to create the live file.
          </div>
        )}

        <CollapsibleSection title="First step — how to help" subtitle="Four options + submit + footer" defaultOpen accent="violet">
          <TextField
            label="Question label"
            value={copy.rolesQuestion}
            onChange={(rolesQuestion) => patchCopy(setCopy, 'rolesQuestion', rolesQuestion)}
          />
          <TextField
            label="Submit button"
            value={copy.submitButton}
            onChange={(submitButton) => patchCopy(setCopy, 'submitButton', submitButton)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Footer text (before link)"
              value={copy.footerPrefix}
              onChange={(footerPrefix) => patchCopy(setCopy, 'footerPrefix', footerPrefix)}
            />
            <TextField
              label="Footer link label"
              value={copy.footerLinkLabel}
              onChange={(footerLinkLabel) => patchCopy(setCopy, 'footerLinkLabel', footerLinkLabel)}
            />
          </div>
          {copy.roles.map((role, i) => (
            <RoleEditor
              key={role.id}
              role={role}
              index={i}
              onChange={(next) =>
                setCopy((c) => ({ ...c, roles: c.roles.map((r, j) => (j === i ? next : r)) }))
              }
            />
          ))}
        </CollapsibleSection>

        <CollapsibleSection title="Contact fields" subtitle="Shown after someone picks an option">
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ['detailsTitleSign', 'Section title (sign request)'],
                ['detailsTitleOther', 'Section title (other paths)'],
                ['nameLabel', 'Full name label'],
                ['namePlaceholder', 'Full name placeholder'],
                ['emailLabel', 'Email label'],
                ['emailPlaceholder', 'Email placeholder'],
                ['phoneLabel', 'Phone label (before * or recommended)'],
                ['phoneRecommended', 'Phone “recommended” suffix'],
                ['phonePlaceholderSign', 'Phone placeholder (sign request)'],
                ['phonePlaceholderOther', 'Phone placeholder (other)'],
                ['cityLabel', 'City label'],
                ['cityPlaceholder', 'City placeholder'],
                ['postalLabel', 'Postal code label'],
                ['postalPlaceholder', 'Postal code placeholder'],
              ] as const
            ).map(([key, label]) => (
              <TextField
                key={key}
                label={label}
                value={copy.contact[key]}
                onChange={(v) => patchNested(setCopy, 'contact', { [key]: v })}
              />
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Sign request" subtitle="Yard sign path — intro copy and form labels" accent="violet">
          <TextField
            label="Section title"
            value={ys.sectionTitle}
            onChange={(sectionTitle) => patchNested(setCopy, 'yardSign', { sectionTitle })}
          />
          <RichTextField
            label="Section copy"
            hint='Use the Link button for /products and mailto: addresses. Spaces around links are preserved in HTML.'
            value={ys.introHtml}
            onChange={(introHtml) => patchNested(setCopy, 'yardSign', { introHtml })}
            rows={5}
          />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 pt-2 border-t border-slate-100">
            Form field labels
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Delivery address label"
              value={ys.deliveryAddressLabel}
              onChange={(deliveryAddressLabel) => patchNested(setCopy, 'yardSign', { deliveryAddressLabel })}
            />
            <TextField
              label="Delivery address placeholder"
              value={ys.deliveryAddressPlaceholder}
              onChange={(deliveryAddressPlaceholder) =>
                patchNested(setCopy, 'yardSign', { deliveryAddressPlaceholder })
              }
            />
            <TextField
              label="Quantity label"
              value={ys.quantityLabel}
              onChange={(quantityLabel) => patchNested(setCopy, 'yardSign', { quantityLabel })}
            />
            <TextField
              label="Quantity placeholder"
              value={ys.quantityPlaceholder}
              onChange={(quantityPlaceholder) => patchNested(setCopy, 'yardSign', { quantityPlaceholder })}
            />
            <TextField
              label="Size label"
              value={ys.sizeLabel}
              onChange={(sizeLabel) => patchNested(setCopy, 'yardSign', { sizeLabel })}
            />
            <TextField
              label="Size placeholder"
              value={ys.sizePlaceholder}
              onChange={(sizePlaceholder) => patchNested(setCopy, 'yardSign', { sizePlaceholder })}
            />
            <TextField
              label="Payment section label"
              value={ys.paymentLabel}
              onChange={(paymentLabel) => patchNested(setCopy, 'yardSign', { paymentLabel })}
            />
            <TextField
              label="Delivery notes label"
              value={ys.deliveryNotesLabel}
              onChange={(deliveryNotesLabel) => patchNested(setCopy, 'yardSign', { deliveryNotesLabel })}
            />
          </div>
          <TextField
            label="Already paid option"
            value={ys.paymentPaidLabel}
            onChange={(paymentPaidLabel) => patchNested(setCopy, 'yardSign', { paymentPaidLabel })}
            multiline
          />
          <TextField
            label="Not yet paid option"
            value={ys.paymentNotYetLabel}
            onChange={(paymentNotYetLabel) => patchNested(setCopy, 'yardSign', { paymentNotYetLabel })}
            multiline
          />
          <TextField
            label="Delivery notes placeholder"
            value={ys.deliveryNotesPlaceholder}
            onChange={(deliveryNotesPlaceholder) =>
              patchNested(setCopy, 'yardSign', { deliveryNotesPlaceholder })
            }
          />
          <SelectOptionsEditor
            label="Quantity options"
            hint="Left code is sent to the sheet (do not change unless you know why)."
            options={ys.quantityOptions}
            onChange={(quantityOptions) => patchNested(setCopy, 'yardSign', { quantityOptions })}
          />
          <SelectOptionsEditor
            label="Size options"
            hint="Values 24x18, 12x16, and any match the order system."
            options={ys.sizeOptions}
            onChange={(sizeOptions) => patchNested(setCopy, 'yardSign', { sizeOptions })}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Pickup hub" subtitle="Drop-off / pickup point path">
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              Object.keys(copy.dropoff) as (keyof typeof copy.dropoff)[]
            ).map((key) => (
              <TextField
                key={key}
                label={key}
                value={copy.dropoff[key]}
                onChange={(v) => patchNested(setCopy, 'dropoff', { [key]: v })}
                multiline={key.includes('Placeholder') || key === 'listPubliclyYes'}
              />
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Volunteer" subtitle="Volunteer path + checkbox list">
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              Object.keys(copy.volunteer) as (keyof typeof copy.volunteer)[]
            ).map((key) => (
              <TextField
                key={key}
                label={key}
                value={copy.volunteer[key]}
                onChange={(v) => patchNested(setCopy, 'volunteer', { [key]: v })}
                multiline={key.includes('Placeholder')}
              />
            ))}
          </div>
          <p className="text-sm font-medium text-slate-800 pt-2">Volunteer role checkboxes</p>
          {copy.volunteerOptions.map((opt, i) => (
            <TextField
              key={opt.id}
              label={opt.id}
              value={opt.label}
              onChange={(label) =>
                setCopy((c) => ({
                  ...c,
                  volunteerOptions: c.volunteerOptions.map((o, j) => (j === i ? { ...o, label } : o)),
                }))
              }
            />
          ))}
        </CollapsibleSection>

        <CollapsibleSection title="Something else" subtitle="Other path">
          <TextField
            label="Section title"
            value={copy.other.sectionTitle}
            onChange={(sectionTitle) => patchNested(setCopy, 'other', { sectionTitle })}
          />
          <RichTextField
            label="Section copy"
            value={copy.other.introHtml}
            onChange={(introHtml) => patchNested(setCopy, 'other', { introHtml })}
            rows={4}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Details label"
              value={copy.other.detailsLabel}
              onChange={(detailsLabel) => patchNested(setCopy, 'other', { detailsLabel })}
            />
            <TextField
              label="Details placeholder"
              value={copy.other.detailsPlaceholder}
              onChange={(detailsPlaceholder) => patchNested(setCopy, 'other', { detailsPlaceholder })}
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Shared & thank-you" subtitle="Consent, extras, success messages">
          <RichTextField
            label="Consent checkbox"
            value={copy.consentText}
            onChange={(consentText) => patchCopy(setCopy, 'consentText', consentText)}
            rows={3}
          />
          <TextField
            label="Thank-you title"
            value={copy.successTitle}
            onChange={(successTitle) => patchCopy(setCopy, 'successTitle', successTitle)}
          />
          <RichTextField
            label="Thank-you body"
            value={copy.successBody}
            onChange={(successBody) => patchCopy(setCopy, 'successBody', successBody)}
            rows={3}
          />
          <RichTextField
            label="Extra thank-you line (sign requests)"
            hint="Shown after a yard-sign submission with payment links."
            value={copy.successYardSign.bodyHtml}
            onChange={(bodyHtml) => patchNested(setCopy, 'successYardSign', { bodyHtml })}
            rows={4}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Anything else label"
              value={copy.shared.anythingElseLabel}
              onChange={(anythingElseLabel) => patchNested(setCopy, 'shared', { anythingElseLabel })}
            />
            <TextField
              label="Anything else placeholder"
              value={copy.shared.anythingElsePlaceholder}
              onChange={(anythingElsePlaceholder) => patchNested(setCopy, 'shared', { anythingElsePlaceholder })}
            />
            <TextField
              label="Sending button text"
              value={copy.shared.sendingLabel}
              onChange={(sendingLabel) => patchNested(setCopy, 'shared', { sendingLabel })}
            />
            <TextField
              label="Submit another sign-up"
              value={copy.shared.submitAnotherLabel}
              onChange={(submitAnotherLabel) => patchNested(setCopy, 'shared', { submitAnotherLabel })}
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Validation & errors" subtitle="Messages when something is missing or fails" defaultOpen={false}>
          {(
            Object.keys(copy.validation) as (keyof typeof copy.validation)[]
          ).map((key) => (
            <TextField
              key={key}
              label={`validation.${key}`}
              value={copy.validation[key]}
              onChange={(v) => patchNested(setCopy, 'validation', { [key]: v })}
            />
          ))}
          {(
            Object.keys(copy.errors) as (keyof typeof copy.errors)[]
          ).map((key) => (
            <TextField
              key={key}
              label={`errors.${key}`}
              value={copy.errors[key]}
              onChange={(v) => patchNested(setCopy, 'errors', { [key]: v })}
              multiline
            />
          ))}
        </CollapsibleSection>

        {publishStatus === 'published' && (
          <p className="text-sm text-emerald-700 font-light mb-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            Published — <strong className="font-normal">/join</strong> is live for all visitors.
          </p>
        )}
        {publishStatus === 'error' && (
          <p className="text-sm text-red-700 font-light mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {publishMessage || 'Could not publish.'}
          </p>
        )}

        {!embedded && (
          <p className="mt-4 text-center pb-4">
            <Link href="/admin?section=events" className="text-sm text-slate-500 hover:text-slate-800 font-light underline">
              Manage events →
            </Link>
            {' · '}
            <Link href="/admin" className="text-sm text-slate-500 hover:text-slate-800 font-light underline">
              All admin
            </Link>
          </p>
        )}
      </main>
  )

  const publishBar = (
      <div className="fixed bottom-0 inset-x-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur-sm px-4 py-4">
        <div className={`mx-auto flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between ${embedded ? 'max-w-3xl' : 'max-w-3xl'} px-0 sm:px-6 md:px-8`}>
          <p className="text-xs text-slate-500 font-light sm:max-w-md">
            Publish updates the live join form. Commit <code className="text-slate-600">get-involved-form.json</code>{' '}
            and push to <code className="text-slate-600">main</code> so changes survive the next deploy.
          </p>
          <button
            type="button"
            onClick={() => void publish()}
            disabled={publishStatus === 'publishing' || loadStatus === 'loading'}
            className="shrink-0 px-6 py-3.5 bg-gradient-to-r from-violet-700 to-[#3d2b7a] text-white text-sm font-medium rounded-xl hover:from-violet-800 disabled:opacity-50"
          >
            {publishStatus === 'publishing' ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>
  )

  if (embedded) {
    return (
      <>
        {main}
        {publishBar}
      </>
    )
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
                Edit every label and message on <strong className="font-normal">/join</strong>, then publish.
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

      {main}
      {publishBar}
    </div>
  )
}
