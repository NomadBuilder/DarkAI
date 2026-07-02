'use client'

import { useEffect, useState, type FormEvent } from 'react'
import {
  buildGetInvolvedSubmitPayload,
  emptyGetInvolvedFormState,
  loadGetInvolvedClientConfig,
} from '@/lib/get-involved'
import { HUB_SITE_NAME } from '@/lib/indigenous-hub'

const FUNDING_EMAIL = 'protectont@gmail.com'

type FundingFormState = {
  name: string
  email: string
  organization: string
  location: string
  campaignUrl: string
  amountRequested: string
  useOfFunds: string
  message: string
  consent: boolean
}

const emptyForm: FundingFormState = {
  name: '',
  email: '',
  organization: '',
  location: '',
  campaignUrl: '',
  amountRequested: '',
  useOfFunds: '',
  message: '',
  consent: false,
}

const inputClass =
  'w-full rounded-xl border border-[#1a4d3a]/15 bg-white px-4 py-2.5 text-sm text-[#142818] placeholder:text-[#5a7a66]/70 focus:outline-none focus:ring-2 focus:ring-[#1a4d3a]/25'
const labelClass = 'block text-sm font-light text-[#3d5c48] mb-1.5'

function buildFundingNotes(form: FundingFormState): string {
  return [
    `=== ${HUB_SITE_NAME} — funding application ===`,
    form.organization.trim() && `Organization / campaign: ${form.organization.trim()}`,
    form.location.trim() && `Location: ${form.location.trim()}`,
    form.campaignUrl.trim() && `Official link: ${form.campaignUrl.trim()}`,
    form.amountRequested.trim() && `Amount requested: ${form.amountRequested.trim()}`,
    form.useOfFunds.trim() && `Use of funds: ${form.useOfFunds.trim()}`,
    form.message.trim() && `Additional context:\n${form.message.trim()}`,
  ]
    .filter(Boolean)
    .join('\n')
}

export default function FundingApplicationForm() {
  const [form, setForm] = useState<FundingFormState>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [submitViaApi, setSubmitViaApi] = useState(false)
  const [sheetSubmitUrl, setSheetSubmitUrl] = useState('')
  const [configLoaded, setConfigLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadGetInvolvedClientConfig().then((cfg) => {
      if (cancelled) return
      setSubmitViaApi(cfg.submitViaApi)
      setSheetSubmitUrl(cfg.sheetSubmitUrl)
      setConfigLoaded(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const setField = <K extends keyof FundingFormState>(key: K, value: FundingFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (submitStatus !== 'idle') setSubmitStatus('idle')
  }

  const openMailtoFallback = () => {
    const subject = `${HUB_SITE_NAME} funding request — ${form.organization.trim() || form.name.trim()}`
    const body = buildFundingNotes(form) + `\n\nContact: ${form.name.trim()} <${form.email.trim()}>`
    window.location.href = `mailto:${FUNDING_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!form.name.trim()) return setErrorMessage('Please enter your name.')
    if (!form.email.trim()) return setErrorMessage('Please enter your email.')
    if (!form.organization.trim()) return setErrorMessage('Please name the organization or campaign.')
    if (!form.useOfFunds.trim()) return setErrorMessage('Please describe how funds would be used.')
    if (!form.message.trim()) return setErrorMessage('Please tell us about the cause and why it matters.')
    if (!form.consent) return setErrorMessage('Please confirm this is an official or authorized request.')

    if (!submitViaApi && !sheetSubmitUrl) {
      openMailtoFallback()
      setSubmitStatus('success')
      setForm(emptyForm)
      return
    }

    setIsSubmitting(true)
    try {
      const giState = {
        ...emptyGetInvolvedFormState,
        role: 'other' as const,
        name: form.name.trim(),
        email: form.email.trim(),
        city: form.location.trim(),
        otherDetails: buildFundingNotes(form),
        consent: true,
      }
      const body = new URLSearchParams(
        buildGetInvolvedSubmitPayload(giState, { sourcePage: 'stand4land/funding' }, [
          { id: 'other', label: `${HUB_SITE_NAME} — funding application` },
        ])
      )
      const submitEndpoint = submitViaApi ? '/api/get-involved-submit' : sheetSubmitUrl
      const res = await fetch(submitEndpoint, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: body.toString(),
      })

      const text = await res.text()
      let ok = res.ok
      if (text) {
        try {
          const parsed = JSON.parse(text) as { success?: boolean; ok?: boolean }
          ok = ok && (parsed.success === true || parsed.ok === true)
        } catch {
          ok = res.ok && text.toLowerCase().includes('success')
        }
      }

      if (!ok) throw new Error('Submission failed')

      setSubmitStatus('success')
      setForm(emptyForm)
    } catch {
      setSubmitStatus('error')
      setErrorMessage(
        configLoaded
          ? 'Something went wrong sending your application. You can also email us directly.'
          : 'Still loading — try again in a moment.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitStatus === 'success') {
    return (
      <div className="rounded-2xl border border-[#1a4d3a]/15 bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl font-light text-[#142818]">Application received</h2>
        <p className="mt-3 text-[#3d5c48] font-light leading-relaxed">
          Thank you. We review a small number of requests and will reply if we can help. We cannot fund every
          worthy cause — capacity is very limited.
        </p>
        <button
          type="button"
          onClick={() => setSubmitStatus('idle')}
          className="mt-6 text-sm text-[#1a4d3a] font-medium hover:underline"
        >
          Submit another application
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[#1a4d3a]/12 bg-white p-6 sm:p-8 shadow-sm space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-1">
          <span className={labelClass}>Your name</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            required
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block sm:col-span-1">
          <span className={labelClass}>Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <label className="block">
        <span className={labelClass}>Organization or campaign name</span>
        <input
          type="text"
          name="organization"
          required
          value={form.organization}
          onChange={(e) => setField('organization', e.target.value)}
          className={inputClass}
          placeholder="Nation, campaign, or community group"
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Location</span>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={(e) => setField('location', e.target.value)}
            className={inputClass}
            placeholder="Community, territory, or province"
          />
        </label>
        <label className="block">
          <span className={labelClass}>Official website or social link</span>
          <input
            type="url"
            name="campaignUrl"
            value={form.campaignUrl}
            onChange={(e) => setField('campaignUrl', e.target.value)}
            className={inputClass}
            placeholder="https://"
          />
        </label>
      </div>

      <label className="block">
        <span className={labelClass}>Amount requested (optional)</span>
        <input
          type="text"
          name="amountRequested"
          value={form.amountRequested}
          onChange={(e) => setField('amountRequested', e.target.value)}
          className={inputClass}
          placeholder="e.g. $50 for travel, $100 for legal fees"
        />
      </label>

      <label className="block">
        <span className={labelClass}>How would funds be used?</span>
        <textarea
          name="useOfFunds"
          required
          rows={3}
          value={form.useOfFunds}
          onChange={(e) => setField('useOfFunds', e.target.value)}
          className={`${inputClass} resize-y min-h-[5rem]`}
          placeholder="Legal defence, camp supplies, travel to territory, printing, etc."
        />
      </label>

      <label className="block">
        <span className={labelClass}>Tell us about the cause</span>
        <textarea
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => setField('message', e.target.value)}
          className={`${inputClass} resize-y min-h-[7rem]`}
          placeholder="What is at stake? Why is this Nation-led? What would support make possible?"
        />
      </label>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(e) => setField('consent', e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-[#1a4d3a]/25 text-[#1a4d3a] focus:ring-[#1a4d3a]/25"
        />
        <span className="text-sm text-[#3d5c48] font-light leading-relaxed">
          I confirm this request is authorized by the organization or campaign named above, and that official
          channels exist where Protect Ontario can verify the work.
        </span>
      </label>

      {errorMessage && (
        <p className="text-sm text-[#9f1239] font-light" role="alert">
          {errorMessage}
          {submitStatus === 'error' && (
            <>
              {' '}
              <button type="button" onClick={openMailtoFallback} className="underline hover:text-[#7f0f2e]">
                Email {FUNDING_EMAIL}
              </button>
            </>
          )}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto rounded-xl bg-[#1a4d3a] px-8 py-3.5 text-sm font-medium text-white hover:bg-[#143d2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#1a4d3a]/15"
      >
        {isSubmitting ? 'Sending…' : 'Submit application'}
      </button>
    </form>
  )
}
