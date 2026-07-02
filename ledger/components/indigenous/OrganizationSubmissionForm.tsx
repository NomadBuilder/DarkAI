'use client'

import { useEffect, useState, type FormEvent } from 'react'
import {
  buildGetInvolvedSubmitPayload,
  emptyGetInvolvedFormState,
  loadGetInvolvedClientConfig,
} from '@/lib/get-involved'
import { HUB_SITE_NAME, PROVINCE_LABELS, type IndigenousProvince } from '@/lib/indigenous-hub'

const HUB_EMAIL = 'protectont@gmail.com'

const ORG_TYPES = [
  'Indigenous-led organization',
  'Legal advocacy',
  'Conservation & IPCAs',
  'Research & education',
  'Environmental justice',
  'Political advocacy',
  'Climate justice',
  'Other',
] as const

type OrgSubmitFormState = {
  name: string
  email: string
  orgName: string
  orgType: string
  regions: IndigenousProvince[]
  website: string
  donateUrl: string
  mission: string
  initiatives: string
  relatedCampaigns: string
  whyList: string
  consent: boolean
}

const emptyForm: OrgSubmitFormState = {
  name: '',
  email: '',
  orgName: '',
  orgType: '',
  regions: [],
  website: '',
  donateUrl: '',
  mission: '',
  initiatives: '',
  relatedCampaigns: '',
  whyList: '',
  consent: false,
}

const inputClass =
  'w-full rounded-lg border border-[var(--hub-land-forest)]/15 bg-[var(--hub-land-paper)] px-4 py-2.5 text-sm text-[var(--hub-land-ink)] placeholder:text-[var(--hub-land-muted)]/70 focus:outline-none focus:ring-2 focus:ring-[var(--hub-land-forest)]/25'
const labelClass = 'block text-sm text-[var(--hub-land-muted)] mb-1.5'

function buildOrgSubmitNotes(form: OrgSubmitFormState): string {
  const regions = form.regions.map((r) => PROVINCE_LABELS[r]).join(', ')
  return [
    `=== ${HUB_SITE_NAME} — organization listing request ===`,
    `Organization: ${form.orgName.trim()}`,
    form.orgType && `Type: ${form.orgType}`,
    regions && `Regions: ${regions}`,
    form.website.trim() && `Website: ${form.website.trim()}`,
    form.donateUrl.trim() && `Donate link: ${form.donateUrl.trim()}`,
    form.mission.trim() && `Mission:\n${form.mission.trim()}`,
    form.initiatives.trim() && `Programs / initiatives:\n${form.initiatives.trim()}`,
    form.relatedCampaigns.trim() && `Related campaigns: ${form.relatedCampaigns.trim()}`,
    form.whyList.trim() && `Why list this org:\n${form.whyList.trim()}`,
  ]
    .filter(Boolean)
    .join('\n')
}

export default function OrganizationSubmissionForm() {
  const [form, setForm] = useState<OrgSubmitFormState>(emptyForm)
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

  const setField = <K extends keyof OrgSubmitFormState>(key: K, value: OrgSubmitFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (submitStatus !== 'idle') setSubmitStatus('idle')
  }

  const toggleRegion = (region: IndigenousProvince) => {
    setForm((prev) => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter((r) => r !== region)
        : [...prev.regions, region],
    }))
    if (submitStatus !== 'idle') setSubmitStatus('idle')
  }

  const openMailtoFallback = () => {
    const subject = `${HUB_SITE_NAME} org listing — ${form.orgName.trim()}`
    const body =
      buildOrgSubmitNotes(form) + `\n\nSubmitted by: ${form.name.trim()} <${form.email.trim()}>`
    window.location.href = `mailto:${HUB_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!form.name.trim()) return setErrorMessage('Please enter your name.')
    if (!form.email.trim()) return setErrorMessage('Please enter your email.')
    if (!form.orgName.trim()) return setErrorMessage('Please enter the organization name.')
    if (!form.orgType) return setErrorMessage('Please select an organization type.')
    if (form.regions.length === 0) return setErrorMessage('Please select at least one region.')
    if (!form.website.trim()) return setErrorMessage('Please provide an official website.')
    if (!form.mission.trim()) return setErrorMessage('Please describe the organization\'s mission.')
    if (!form.whyList.trim()) return setErrorMessage('Please explain why this organization belongs in the directory.')
    if (!form.consent) return setErrorMessage('Please confirm the information is accurate and verifiable.')

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
        otherDetails: buildOrgSubmitNotes(form),
        consent: true,
      }
      const body = new URLSearchParams(
        buildGetInvolvedSubmitPayload(giState, { sourcePage: 'stand4land/organizations/submit' }, [
          { id: 'other', label: `${HUB_SITE_NAME} — organization listing request` },
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
          ? 'Something went wrong sending your submission. You can also email us directly.'
          : 'Still loading — try again in a moment.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitStatus === 'success') {
    return (
      <div className="hub-land-card rounded-xl border p-6 sm:p-8">
        <h2 className="hub-display text-xl font-semibold text-[var(--hub-land-ink)]">Submission received</h2>
        <p className="mt-3 text-[var(--hub-land-muted)] leading-relaxed">
          Thank you. We review every organization suggestion before adding it to the directory. Listings must be
          Indigenous-led or clearly support Indigenous land and water defence through official, verifiable channels.
        </p>
        <button
          type="button"
          onClick={() => setSubmitStatus('idle')}
          className="mt-6 text-sm text-[var(--hub-land-forest)] font-medium hover:underline"
        >
          Submit another organization
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="hub-land-card rounded-xl border p-6 sm:p-8 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
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
        <label className="block">
          <span className={labelClass}>Your email</span>
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
        <span className={labelClass}>Organization name</span>
        <input
          type="text"
          name="orgName"
          required
          value={form.orgName}
          onChange={(e) => setField('orgName', e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Organization type</span>
        <select
          name="orgType"
          required
          value={form.orgType}
          onChange={(e) => setField('orgType', e.target.value)}
          className={inputClass}
        >
          <option value="">Select a type…</option>
          {ORG_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      <fieldset>
        <legend className={labelClass}>Regions served</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(Object.keys(PROVINCE_LABELS) as IndigenousProvince[]).map((code) => {
            const selected = form.regions.includes(code)
            return (
              <button
                key={code}
                type="button"
                onClick={() => toggleRegion(code)}
                className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                  selected
                    ? 'bg-[var(--hub-land-forest)] text-white border-[var(--hub-land-forest)]'
                    : 'bg-transparent text-[var(--hub-land-muted)] border-[var(--hub-land-forest)]/20 hover:border-[var(--hub-land-forest)]/40'
                }`}
              >
                {PROVINCE_LABELS[code]}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Official website</span>
          <input
            type="url"
            name="website"
            required
            value={form.website}
            onChange={(e) => setField('website', e.target.value)}
            className={inputClass}
            placeholder="https://"
          />
        </label>
        <label className="block">
          <span className={labelClass}>Donate link (optional)</span>
          <input
            type="url"
            name="donateUrl"
            value={form.donateUrl}
            onChange={(e) => setField('donateUrl', e.target.value)}
            className={inputClass}
            placeholder="https://"
          />
        </label>
      </div>

      <label className="block">
        <span className={labelClass}>Mission</span>
        <textarea
          name="mission"
          required
          rows={3}
          value={form.mission}
          onChange={(e) => setField('mission', e.target.value)}
          className={`${inputClass} resize-y min-h-[5rem]`}
          placeholder="What does this organization do for land, water, or treaty rights?"
        />
      </label>

      <label className="block">
        <span className={labelClass}>Key programs or initiatives (optional)</span>
        <textarea
          name="initiatives"
          rows={3}
          value={form.initiatives}
          onChange={(e) => setField('initiatives', e.target.value)}
          className={`${inputClass} resize-y min-h-[5rem]`}
          placeholder="One per line is fine — e.g. legal defence fund, IPCA support, youth land camps"
        />
      </label>

      <label className="block">
        <span className={labelClass}>Related campaigns on this site (optional)</span>
        <input
          type="text"
          name="relatedCampaigns"
          value={form.relatedCampaigns}
          onChange={(e) => setField('relatedCampaigns', e.target.value)}
          className={inputClass}
          placeholder="Campaign names or slugs, if any"
        />
      </label>

      <label className="block">
        <span className={labelClass}>Why should we list this organization?</span>
        <textarea
          name="whyList"
          required
          rows={4}
          value={form.whyList}
          onChange={(e) => setField('whyList', e.target.value)}
          className={`${inputClass} resize-y min-h-[6rem]`}
          placeholder="How is it Indigenous-led or Indigenous-supporting? What official channels can we verify?"
        />
      </label>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(e) => setField('consent', e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-[var(--hub-land-forest)]/25 text-[var(--hub-land-forest)] focus:ring-[var(--hub-land-forest)]/25"
        />
        <span className="text-sm text-[var(--hub-land-muted)] leading-relaxed">
          I confirm this information is accurate and that the organization has an official website or Nation channel
          where Protect Ontario can verify its work before listing.
        </span>
      </label>

      {errorMessage && (
        <p className="text-sm text-[#9f1239]" role="alert">
          {errorMessage}
          {submitStatus === 'error' && (
            <>
              {' '}
              <button type="button" onClick={openMailtoFallback} className="underline hover:text-[#7f0f2e]">
                Email {HUB_EMAIL}
              </button>
            </>
          )}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto rounded-lg bg-[var(--hub-land-forest)] px-8 py-3.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Sending…' : 'Submit for review'}
      </button>
    </form>
  )
}
