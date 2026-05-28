'use client'

import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'
import {
  buildGetInvolvedSubmitPayload,
  emptyGetInvolvedFormState,
  loadGetInvolvedClientConfig,
  involvementRoles,
  volunteerRoleOptions,
  type GetInvolvedFormState,
  type InvolvementRole,
} from '@/lib/get-involved'
const defaultInputClass =
  'w-full px-4 py-3 border border-gray-300 rounded-lg text-sm md:text-base font-light focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const defaultLabelClass = 'block text-sm md:text-base font-light text-gray-700 mb-2'

export type GetInvolvedFormProps = {
  variant?: 'default' | 'ff'
  sourcePage?: string
  /** When set, selects this role and scrolls focus into the form (parent handles scroll). */
  presetRole?: InvolvementRole | ''
  /** Drop outer card chrome when parent provides a container (e.g. ff get-involved page). */
  embedded?: boolean
}

function toggleInList(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
}

export default function GetInvolvedForm({
  variant = 'default',
  sourcePage = 'get-involved',
  presetRole = '',
  embedded = false,
}: GetInvolvedFormProps) {
  const isFf = variant === 'ff'
  const inputClass = isFf
    ? 'w-full px-4 py-3 border border-gray-300 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#ff9a3c] focus:border-transparent'
    : defaultInputClass
  const labelClass = isFf
    ? 'block text-sm md:text-base text-gray-800 mb-2'
    : defaultLabelClass
  const roleSelectedClass = isFf
    ? 'border-[#ff9a3c] bg-[#fff4e8] ring-1 ring-[#ff9a3c]'
    : 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500'
  const submitButtonClass = isFf
    ? 'w-full px-6 md:px-8 py-4 md:py-5 bg-[#3d2b7a] text-[#f9e04c] rounded-xl text-base md:text-lg font-semibold hover:bg-[#2f2260] transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
    : 'w-full px-6 md:px-8 py-4 md:py-5 bg-slate-900 text-white rounded-lg text-base md:text-lg font-light hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const shellClass = embedded
    ? 'p-8 md:p-10 lg:p-12 space-y-8'
    : 'bg-white rounded-2xl p-8 md:p-12 border border-gray-200 shadow-lg space-y-8'
  const linkClass = isFf
    ? 'text-[#ff9a3c] underline underline-offset-2 hover:text-[#ffb366]'
    : 'text-blue-600 underline underline-offset-2 hover:text-blue-700'

  const [form, setForm] = useState<GetInvolvedFormState>(emptyGetInvolvedFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [lastSubmittedRole, setLastSubmittedRole] = useState<InvolvementRole | ''>('')
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

  useEffect(() => {
    if (!presetRole) return
    setForm((prev) => ({ ...prev, role: presetRole }))
    if (submitStatus !== 'idle') setSubmitStatus('idle')
  }, [presetRole])

  const role = form.role as InvolvementRole | ''
  const isSignRequest = role === 'yard-sign'

  const setField = <K extends keyof GetInvolvedFormState>(key: K, value: GetInvolvedFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (submitStatus !== 'idle') setSubmitStatus('idle')
  }

  const validate = (): string | null => {
    if (!form.role) return 'Please choose how you want to get involved.'
    if (!form.name.trim()) return 'Please enter your name.'
    if (!form.email.trim()) return 'Please enter your email.'
    if (!form.consent) return 'Please confirm you agree to be contacted.'

    if (form.role === 'yard-sign') {
      if (!form.phone.trim()) return 'Please enter a phone number so we can arrange delivery.'
      if (!form.city.trim()) return 'Please enter your city or community.'
      if (!form.postalCode.trim()) return 'Please enter your postal code.'
      if (!form.yardSignDeliveryAddress.trim()) {
        return 'Please tell us where you live / where we should deliver the sign(s).'
      }
      if (!form.yardSignSize) return 'Please choose a sign size.'
      if (!form.yardSignQuantity) return 'Please tell us how many signs you need.'
      if (!form.yardSignPaymentStatus) return 'Please tell us if you have paid yet ($10 per sign).'
    } else if (!form.city.trim()) {
      return 'Please enter your city or community.'
    }

    if (form.role === 'other') {
      if (!form.otherDetails.trim()) return 'Please describe what you’re looking for.'
    }
    if (form.role === 'dropoff') {
      if (!form.dropoffLocation.trim()) return 'Please describe where you can host pickup or drop-off.'
      if (!form.dropoffAvailability.trim()) return 'Please share when you are usually available.'
      if (!form.dropoffListPublicly) return 'Please say whether we may list your area publicly.'
    }
    if (form.role === 'volunteer') {
      if (form.volunteerRoles.length === 0) return 'Please select at least one way you can help.'
      if (!form.volunteerAvailability.trim()) return 'Please share your general availability.'
    }
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setSubmitStatus('error')
      setErrorMessage(validationError)
      return
    }

    if (!submitViaApi && !sheetSubmitUrl) {
      setSubmitStatus('error')
      setErrorMessage(
        configLoaded
          ? 'Sign-up is temporarily unavailable. Please try again later or use the About contact form.'
          : 'Still loading—please try again in a moment.'
      )
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const body = new URLSearchParams(buildGetInvolvedSubmitPayload(form, { sourcePage }))
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

      setLastSubmittedRole(form.role as InvolvementRole)
      setSubmitStatus('success')
      setForm(emptyGetInvolvedFormState)
    } catch {
      setSubmitStatus('error')
      setErrorMessage(
        'Something went wrong sending your sign-up. Please try again in a moment, or email the organizers listed on About.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitStatus === 'success') {
    return (
      <div className={`${shellClass} text-center`}>
        <h2 className="text-2xl font-light text-gray-900">Thank you</h2>
        <p className="text-gray-600 font-light leading-relaxed max-w-md mx-auto">
          We received your sign-up. A volunteer will follow up by email when we can match you locally.
        </p>
        {lastSubmittedRole === 'yard-sign' && (
          <p className="text-sm text-gray-500 font-light max-w-md mx-auto">
            Haven&apos;t paid yet?{' '}
            <Link href="/products" className={linkClass}>
              Pay $10 per sign on Products
            </Link>{' '}
            when you&apos;re ready.
          </p>
        )}
        <button
          type="button"
          onClick={() => setSubmitStatus('idle')}
          className={`mt-4 text-sm ${linkClass} font-light`}
        >
          Submit another sign-up
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={shellClass}>
      <fieldset className="space-y-4">
        <legend className={labelClass}>How do you want to get involved? *</legend>
        <div className="space-y-3">
          {involvementRoles.map((item) => (
            <label
              key={item.id}
              className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                form.role === item.id ? roleSelectedClass : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="role"
                value={item.id}
                checked={form.role === item.id}
                onChange={() => setField('role', item.id)}
                className="mt-1 shrink-0"
                required={!form.role}
              />
              <span>
                <span className="block text-sm font-medium text-gray-900">{item.label}</span>
                <span className="block text-sm text-gray-600 font-light mt-0.5">{item.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {form.role && (
        <>
          <div className="border-t border-gray-100 pt-8 space-y-6">
            <h3 className="text-lg font-light text-gray-900">
              {isSignRequest ? 'Your details' : 'Your contact info'}
            </h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="gi-name" className={labelClass}>
                  Full name *
                </label>
                <input
                  id="gi-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  className={inputClass}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="gi-email" className={labelClass}>
                  Email *
                </label>
                <input
                  id="gi-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="gi-phone" className={labelClass}>
                  Phone {isSignRequest ? '*' : ''}
                  {!isSignRequest && (
                    <span className="text-gray-400"> (recommended)</span>
                  )}
                </label>
                <input
                  id="gi-phone"
                  type="tel"
                  autoComplete="tel"
                  required={isSignRequest}
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  className={inputClass}
                  placeholder={isSignRequest ? 'For delivery coordination' : 'Optional'}
                />
              </div>
              <div>
                <label htmlFor="gi-city" className={labelClass}>
                  City / community *
                </label>
                <input
                  id="gi-city"
                  type="text"
                  autoComplete="address-level2"
                  required
                  value={form.city}
                  onChange={(e) => setField('city', e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Toronto, Ottawa, Hamilton"
                />
              </div>
              <div>
                <label htmlFor="gi-postal" className={labelClass}>
                  Postal code {isSignRequest ? '*' : ''}
                </label>
                <input
                  id="gi-postal"
                  type="text"
                  autoComplete="postal-code"
                  required={isSignRequest}
                  value={form.postalCode}
                  onChange={(e) => setField('postalCode', e.target.value)}
                  className={inputClass}
                  placeholder="e.g. M5V 1A1"
                />
              </div>
            </div>
          </div>

          {role === 'yard-sign' && (
            <div className="border-t border-gray-100 pt-8 space-y-6">
              <h3 className="text-lg font-light text-gray-900">Sign request</h3>
              <p className="text-sm text-gray-600 font-light -mt-4">
                $10 per sign, delivered by volunteers—not shipped by mail. Pay on{' '}
                <Link href="/products" className={linkClass}>
                  Products
                </Link>{' '}
                or via e-transfer to{' '}
                <a href="mailto:FIGHT_FORD_SIGNS@outlook.com" className={linkClass}>
                  FIGHT_FORD_SIGNS@outlook.com
                </a>{' '}
                (preferred) when you&apos;re ready.
              </p>
              <div className="sm:col-span-2">
                <label htmlFor="gi-delivery-addr" className={labelClass}>
                  Where you live / delivery address *
                </label>
                <textarea
                  id="gi-delivery-addr"
                  rows={2}
                  required
                  value={form.yardSignDeliveryAddress}
                  onChange={(e) => setField('yardSignDeliveryAddress', e.target.value)}
                  className={`${inputClass} resize-y`}
                  placeholder="Street address, intersection, or clear directions for drop-off"
                />
              </div>
              <div>
                <label htmlFor="gi-qty" className={labelClass}>
                  How many signs? *
                </label>
                <select
                  id="gi-qty"
                  value={form.yardSignQuantity}
                  onChange={(e) => setField('yardSignQuantity', e.target.value)}
                  className={`${inputClass} bg-white`}
                  required
                >
                  <option value="">Select quantity</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4+">4 or more</option>
                </select>
              </div>
              <div>
                <label htmlFor="gi-size" className={labelClass}>
                  Size *
                </label>
                <select
                  id="gi-size"
                  value={form.yardSignSize}
                  onChange={(e) => setField('yardSignSize', e.target.value as GetInvolvedFormState['yardSignSize'])}
                  className={`${inputClass} bg-white`}
                  required
                >
                  <option value="">Select a size</option>
                  <option value="24x18">24&quot; × 18&quot;</option>
                  <option value="18x12">18&quot; × 12&quot;</option>
                </select>
              </div>
              <div>
                <span className={labelClass}>Payment *</span>
                <div className="space-y-2">
                  {(
                    [
                      ['paid', 'I already paid $10 per sign on Stripe'],
                      ['not-yet', 'Not yet — I will pay on Products ($10 per sign)'],
                    ] as const
                  ).map(([value, label]) => (
                    <label key={value} className="flex items-center gap-2 text-sm font-light text-gray-700">
                      <input
                        type="radio"
                        name="yardSignPaymentStatus"
                        checked={form.yardSignPaymentStatus === value}
                        onChange={() => setField('yardSignPaymentStatus', value)}
                        required={!form.yardSignPaymentStatus}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="gi-yard-notes" className={labelClass}>
                  Delivery notes (optional)
                </label>
                <textarea
                  id="gi-yard-notes"
                  rows={2}
                  value={form.yardSignNotes}
                  onChange={(e) => setField('yardSignNotes', e.target.value)}
                  className={`${inputClass} resize-y`}
                  placeholder="Porch vs apartment, best times, etc."
                />
              </div>
            </div>
          )}

          {role === 'dropoff' && (
            <div className="border-t border-gray-100 pt-8 space-y-6">
              <h3 className="text-lg font-light text-gray-900">Drop-off / pickup point</h3>
              <div>
                <label htmlFor="gi-dropoff-loc" className={labelClass}>
                  Address or area you can serve *
                </label>
                <textarea
                  id="gi-dropoff-loc"
                  rows={3}
                  required
                  value={form.dropoffLocation}
                  onChange={(e) => setField('dropoffLocation', e.target.value)}
                  className={`${inputClass} resize-y`}
                  placeholder="Neighbourhood, intersection, or full address if you are comfortable sharing"
                />
              </div>
              <div>
                <label htmlFor="gi-dropoff-when" className={labelClass}>
                  When are you usually available? *
                </label>
                <input
                  id="gi-dropoff-when"
                  type="text"
                  value={form.dropoffAvailability}
                  onChange={(e) => setField('dropoffAvailability', e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Weekday evenings, Saturday mornings, flexible"
                />
              </div>
              <div>
                <label htmlFor="gi-dropoff-cap" className={labelClass}>
                  Roughly how many signs can you store at once?
                </label>
                <input
                  id="gi-dropoff-cap"
                  type="text"
                  value={form.dropoffCapacity}
                  onChange={(e) => setField('dropoffCapacity', e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 5–10 in a garage"
                />
              </div>
              <div>
                <span className={labelClass}>May we list your area publicly for neighbours? *</span>
                <div className="flex flex-wrap gap-4">
                  {(['yes', 'no'] as const).map((value) => (
                    <label key={value} className="flex items-center gap-2 text-sm font-light text-gray-700">
                      <input
                        type="radio"
                        name="dropoffListPublicly"
                        checked={form.dropoffListPublicly === value}
                        onChange={() => setField('dropoffListPublicly', value)}
                      />
                      {value === 'yes' ? 'Yes — general area only' : 'No — coordinate privately'}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {role === 'volunteer' && (
            <div className="border-t border-gray-100 pt-8 space-y-6">
              <h3 className="text-lg font-light text-gray-900">Volunteer</h3>
              <div>
                <span className={labelClass}>What can you help with? *</span>
                <div className="space-y-2">
                  {volunteerRoleOptions.map((opt) => (
                    <label key={opt.id} className="flex items-start gap-2 text-sm font-light text-gray-700">
                      <input
                        type="checkbox"
                        checked={form.volunteerRoles.includes(opt.id)}
                        onChange={() =>
                          setField('volunteerRoles', toggleInList(form.volunteerRoles, opt.id))
                        }
                        className="mt-0.5"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="gi-vol-avail" className={labelClass}>
                  General availability *
                </label>
                <textarea
                  id="gi-vol-avail"
                  rows={2}
                  value={form.volunteerAvailability}
                  onChange={(e) => setField('volunteerAvailability', e.target.value)}
                  className={`${inputClass} resize-y`}
                  placeholder="Hours per week, days, or specific dates"
                />
              </div>
              <div>
                <span className={labelClass}>Do you have a vehicle for local runs?</span>
                <div className="flex flex-wrap gap-4">
                  {(['yes', 'no'] as const).map((value) => (
                    <label key={value} className="flex items-center gap-2 text-sm font-light text-gray-700">
                      <input
                        type="radio"
                        name="volunteerHasVehicle"
                        checked={form.volunteerHasVehicle === value}
                        onChange={() => setField('volunteerHasVehicle', value)}
                      />
                      {value === 'yes' ? 'Yes' : 'No'}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {role === 'other' && (
            <div className="border-t border-gray-100 pt-8 space-y-4">
              <h3 className="text-lg font-light text-gray-900">Something else</h3>
              <p className="text-sm text-gray-600 font-light -mt-2">
                Weird idea? Partnership? Something we didn&apos;t list? Put it here—we read everything.
              </p>
              <div>
                <label htmlFor="gi-other" className={labelClass}>
                  What do you need? *
                </label>
                <textarea
                  id="gi-other"
                  rows={5}
                  required
                  value={form.otherDetails}
                  onChange={(e) => setField('otherDetails', e.target.value)}
                  className={`${inputClass} resize-y`}
                  placeholder="Describe your request in a few sentences…"
                />
              </div>
            </div>
          )}

          {role !== 'other' && role !== 'yard-sign' && (
            <div className="border-t border-gray-100 pt-8 space-y-4">
              <label htmlFor="gi-notes" className={labelClass}>
                Anything else?
              </label>
              <textarea
                id="gi-notes"
                rows={3}
                value={form.additionalNotes}
                onChange={(e) => setField('additionalNotes', e.target.value)}
                className={`${inputClass} resize-y`}
                placeholder="Optional"
              />
            </div>
          )}

          <label className="flex items-start gap-3 text-sm font-light text-gray-700">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(e) => setField('consent', e.target.checked)}
              className="mt-1 shrink-0"
              required
            />
            <span>
              I agree that Protect Ontario volunteers may contact me about this sign-up. My details are used only for
              organizing—not sold to third parties. *
            </span>
          </label>
        </>
      )}

      {submitStatus === 'error' && errorMessage && (
        <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4 text-red-800 text-sm font-light">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !form.role || !configLoaded}
        className={submitButtonClass}
      >
        {isSubmitting ? 'Sending…' : 'Submit sign-up'}
      </button>

      <p className="text-xs text-gray-500 font-light text-center leading-relaxed">
        Rallies and corrections: use the{' '}
        <Link href="/about#contact" className={linkClass}>
          About contact form
        </Link>
        .
      </p>
    </form>
  )
}
