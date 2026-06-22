'use client'

import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'
import {
  buildGetInvolvedSubmitPayload,
  emptyGetInvolvedFormState,
  loadGetInvolvedClientConfig,
  type GetInvolvedFormState,
  type InvolvementRole,
} from '@/lib/get-involved'
import {
  defaultGetInvolvedFormCopy,
  loadGetInvolvedFormCopy,
  type GetInvolvedFormCopy,
} from '@/lib/get-involved-form-config'
import FormHtml from '@/components/FormHtml'

const defaultInputClass =
  'w-full px-4 py-3 border border-gray-300 rounded-lg text-sm md:text-base font-light focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
const defaultLabelClass = 'block text-sm md:text-base font-light text-gray-700 mb-2'

export type GetInvolvedFormProps = {
  variant?: 'default' | 'ff'
  sourcePage?: string
  presetRole?: InvolvementRole | ''
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
  const formHtmlLinkClass = isFf
    ? '[&_a]:text-[#ff9a3c] [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-[#ffb366]'
    : '[&_a]:text-blue-600 [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:text-blue-700'

  const [form, setForm] = useState<GetInvolvedFormState>(emptyGetInvolvedFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [lastSubmittedRole, setLastSubmittedRole] = useState<InvolvementRole | ''>('')
  const [submitViaApi, setSubmitViaApi] = useState(false)
  const [sheetSubmitUrl, setSheetSubmitUrl] = useState('')
  const [configLoaded, setConfigLoaded] = useState(false)
  const [formCopy, setFormCopy] = useState<GetInvolvedFormCopy>(defaultGetInvolvedFormCopy())

  useEffect(() => {
    let cancelled = false
    loadGetInvolvedFormCopy().then((copy) => {
      if (!cancelled) setFormCopy(copy)
    })
    return () => {
      cancelled = true
    }
  }, [])

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
  }, [presetRole, submitStatus])

  const role = form.role as InvolvementRole | ''
  const isSignRequest = role === 'yard-sign'
  const v = formCopy.validation
  const c = formCopy.contact
  const ys = formCopy.yardSign

  const setField = <K extends keyof GetInvolvedFormState>(key: K, value: GetInvolvedFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (submitStatus !== 'idle') setSubmitStatus('idle')
  }

  const validate = (): string | null => {
    if (!form.role) return v.chooseRole
    if (!form.name.trim()) return v.name
    if (!form.email.trim()) return v.email
    if (!form.consent) return v.consent

    if (form.role === 'yard-sign') {
      if (!form.phone.trim()) return v.phoneSign
      if (!form.city.trim()) return v.city
      if (!form.postalCode.trim()) return v.postalSign
      if (!form.yardSignDeliveryAddress.trim()) return v.deliveryAddress
      if (!form.yardSignSize) return v.signSize
      if (!form.yardSignQuantity) return v.signQuantity
      if (!form.yardSignPaymentStatus) return v.signPayment
    } else if (!form.city.trim()) {
      return v.city
    }

    if (form.role === 'other' && !form.otherDetails.trim()) return v.otherDetails
    if (form.role === 'dropoff') {
      if (!form.dropoffLocation.trim()) return v.dropoffLocation
      if (!form.dropoffAvailability.trim()) return v.dropoffAvailability
      if (!form.dropoffListPublicly) return v.dropoffListPublicly
    }
    if (form.role === 'volunteer') {
      if (form.volunteerRoles.length === 0) return v.volunteerRoles
      if (!form.volunteerAvailability.trim()) return v.volunteerAvailability
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
      setErrorMessage(configLoaded ? formCopy.errors.unavailable : formCopy.errors.loading)
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const body = new URLSearchParams(
        buildGetInvolvedSubmitPayload(form, { sourcePage }, formCopy.roles)
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

      setLastSubmittedRole(form.role as InvolvementRole)
      setSubmitStatus('success')
      setForm(emptyGetInvolvedFormState)
    } catch {
      setSubmitStatus('error')
      setErrorMessage(formCopy.errors.submitFailed)
    } finally {
      setIsSubmitting(false)
    }
  }

  const sy = formCopy.successYardSign

  if (submitStatus === 'success') {
    return (
      <div className={`${shellClass} text-center`}>
        <h2 className="text-2xl font-light text-gray-900">{formCopy.successTitle}</h2>
        <p className="text-gray-600 font-light leading-relaxed max-w-md mx-auto">{formCopy.successBody}</p>
        {lastSubmittedRole === 'yard-sign' && (
          <FormHtml
            html={sy.bodyHtml}
            className="text-sm text-gray-500 font-light max-w-md mx-auto"
            linkClassName={formHtmlLinkClass}
          />
        )}
        <button
          type="button"
          onClick={() => setSubmitStatus('idle')}
          className={`mt-4 text-sm ${linkClass} font-light`}
        >
          {formCopy.shared.submitAnotherLabel}
        </button>
      </div>
    )
  }

  const df = formCopy.dropoff
  const vol = formCopy.volunteer
  const oth = formCopy.other
  const sh = formCopy.shared

  return (
    <form onSubmit={handleSubmit} className={shellClass}>
      <fieldset className="space-y-4">
        <legend className={labelClass}>{formCopy.rolesQuestion}</legend>
        <div className="space-y-3">
          {formCopy.roles.map((item) => (
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
              {isSignRequest ? c.detailsTitleSign : c.detailsTitleOther}
            </h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="gi-name" className={labelClass}>
                  {c.nameLabel}
                </label>
                <input
                  id="gi-name"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  className={inputClass}
                  placeholder={c.namePlaceholder}
                />
              </div>
              <div>
                <label htmlFor="gi-email" className={labelClass}>
                  {c.emailLabel}
                </label>
                <input
                  id="gi-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  className={inputClass}
                  placeholder={c.emailPlaceholder}
                />
              </div>
              <div>
                <label htmlFor="gi-phone" className={labelClass}>
                  {c.phoneLabel}
                  {isSignRequest ? ' *' : ''}
                  {!isSignRequest && <span className="text-gray-400">{c.phoneRecommended}</span>}
                </label>
                <input
                  id="gi-phone"
                  type="tel"
                  autoComplete="tel"
                  required={isSignRequest}
                  value={form.phone}
                  onChange={(e) => setField('phone', e.target.value)}
                  className={inputClass}
                  placeholder={isSignRequest ? c.phonePlaceholderSign : c.phonePlaceholderOther}
                />
              </div>
              <div>
                <label htmlFor="gi-city" className={labelClass}>
                  {c.cityLabel}
                </label>
                <input
                  id="gi-city"
                  type="text"
                  autoComplete="address-level2"
                  required
                  value={form.city}
                  onChange={(e) => setField('city', e.target.value)}
                  className={inputClass}
                  placeholder={c.cityPlaceholder}
                />
              </div>
              <div>
                <label htmlFor="gi-postal" className={labelClass}>
                  {c.postalLabel}
                  {isSignRequest ? ' *' : ''}
                </label>
                <input
                  id="gi-postal"
                  type="text"
                  autoComplete="postal-code"
                  required={isSignRequest}
                  value={form.postalCode}
                  onChange={(e) => setField('postalCode', e.target.value)}
                  className={inputClass}
                  placeholder={c.postalPlaceholder}
                />
              </div>
            </div>
          </div>

          {role === 'yard-sign' && (
            <div className="border-t border-gray-100 pt-8 space-y-6">
              <h3 className="text-lg font-light text-gray-900">{ys.sectionTitle}</h3>
              <FormHtml
                html={ys.introHtml}
                className="text-sm text-gray-600 font-light -mt-4"
                linkClassName={formHtmlLinkClass}
              />
              <div className="sm:col-span-2">
                <label htmlFor="gi-delivery-addr" className={labelClass}>
                  {ys.deliveryAddressLabel}
                </label>
                <textarea
                  id="gi-delivery-addr"
                  rows={2}
                  required
                  value={form.yardSignDeliveryAddress}
                  onChange={(e) => setField('yardSignDeliveryAddress', e.target.value)}
                  className={`${inputClass} resize-y`}
                  placeholder={ys.deliveryAddressPlaceholder}
                />
              </div>
              <div>
                <label htmlFor="gi-qty" className={labelClass}>
                  {ys.quantityLabel}
                </label>
                <select
                  id="gi-qty"
                  value={form.yardSignQuantity}
                  onChange={(e) => setField('yardSignQuantity', e.target.value)}
                  className={`${inputClass} bg-white`}
                  required
                >
                  <option value="">{ys.quantityPlaceholder}</option>
                  {ys.quantityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="gi-size" className={labelClass}>
                  {ys.sizeLabel}
                </label>
                <select
                  id="gi-size"
                  value={form.yardSignSize}
                  onChange={(e) =>
                    setField('yardSignSize', e.target.value as GetInvolvedFormState['yardSignSize'])
                  }
                  className={`${inputClass} bg-white`}
                  required
                >
                  <option value="">{ys.sizePlaceholder}</option>
                  {ys.sizeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className={labelClass}>{ys.paymentLabel}</span>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-light text-gray-700">
                    <input
                      type="radio"
                      name="yardSignPaymentStatus"
                      checked={form.yardSignPaymentStatus === 'paid'}
                      onChange={() => setField('yardSignPaymentStatus', 'paid')}
                      required={!form.yardSignPaymentStatus}
                    />
                    {ys.paymentPaidLabel}
                  </label>
                  <label className="flex items-center gap-2 text-sm font-light text-gray-700">
                    <input
                      type="radio"
                      name="yardSignPaymentStatus"
                      checked={form.yardSignPaymentStatus === 'not-yet'}
                      onChange={() => setField('yardSignPaymentStatus', 'not-yet')}
                    />
                    {ys.paymentNotYetLabel}
                  </label>
                </div>
              </div>
              <div>
                <label htmlFor="gi-yard-notes" className={labelClass}>
                  {ys.deliveryNotesLabel}
                </label>
                <textarea
                  id="gi-yard-notes"
                  rows={2}
                  value={form.yardSignNotes}
                  onChange={(e) => setField('yardSignNotes', e.target.value)}
                  className={`${inputClass} resize-y`}
                  placeholder={ys.deliveryNotesPlaceholder}
                />
              </div>
            </div>
          )}

          {role === 'dropoff' && (
            <div className="border-t border-gray-100 pt-8 space-y-6">
              <h3 className="text-lg font-light text-gray-900">{df.sectionTitle}</h3>
              <div>
                <label htmlFor="gi-dropoff-loc" className={labelClass}>
                  {df.locationLabel}
                </label>
                <textarea
                  id="gi-dropoff-loc"
                  rows={3}
                  required
                  value={form.dropoffLocation}
                  onChange={(e) => setField('dropoffLocation', e.target.value)}
                  className={`${inputClass} resize-y`}
                  placeholder={df.locationPlaceholder}
                />
              </div>
              <div>
                <label htmlFor="gi-dropoff-when" className={labelClass}>
                  {df.availabilityLabel}
                </label>
                <input
                  id="gi-dropoff-when"
                  type="text"
                  value={form.dropoffAvailability}
                  onChange={(e) => setField('dropoffAvailability', e.target.value)}
                  className={inputClass}
                  placeholder={df.availabilityPlaceholder}
                />
              </div>
              <div>
                <label htmlFor="gi-dropoff-cap" className={labelClass}>
                  {df.capacityLabel}
                </label>
                <input
                  id="gi-dropoff-cap"
                  type="text"
                  value={form.dropoffCapacity}
                  onChange={(e) => setField('dropoffCapacity', e.target.value)}
                  className={inputClass}
                  placeholder={df.capacityPlaceholder}
                />
              </div>
              <div>
                <span className={labelClass}>{df.listPubliclyLabel}</span>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm font-light text-gray-700">
                    <input
                      type="radio"
                      name="dropoffListPublicly"
                      checked={form.dropoffListPublicly === 'yes'}
                      onChange={() => setField('dropoffListPublicly', 'yes')}
                    />
                    {df.listPubliclyYes}
                  </label>
                  <label className="flex items-center gap-2 text-sm font-light text-gray-700">
                    <input
                      type="radio"
                      name="dropoffListPublicly"
                      checked={form.dropoffListPublicly === 'no'}
                      onChange={() => setField('dropoffListPublicly', 'no')}
                    />
                    {df.listPubliclyNo}
                  </label>
                </div>
              </div>
            </div>
          )}

          {role === 'volunteer' && (
            <div className="border-t border-gray-100 pt-8 space-y-6">
              <h3 className="text-lg font-light text-gray-900">{vol.sectionTitle}</h3>
              <div>
                <span className={labelClass}>{vol.rolesLabel}</span>
                <div className="space-y-2">
                  {formCopy.volunteerOptions.map((opt) => (
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
                  {vol.availabilityLabel}
                </label>
                <textarea
                  id="gi-vol-avail"
                  rows={2}
                  value={form.volunteerAvailability}
                  onChange={(e) => setField('volunteerAvailability', e.target.value)}
                  className={`${inputClass} resize-y`}
                  placeholder={vol.availabilityPlaceholder}
                />
              </div>
              <div>
                <span className={labelClass}>{vol.vehicleLabel}</span>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm font-light text-gray-700">
                    <input
                      type="radio"
                      name="volunteerHasVehicle"
                      checked={form.volunteerHasVehicle === 'yes'}
                      onChange={() => setField('volunteerHasVehicle', 'yes')}
                    />
                    {vol.vehicleYes}
                  </label>
                  <label className="flex items-center gap-2 text-sm font-light text-gray-700">
                    <input
                      type="radio"
                      name="volunteerHasVehicle"
                      checked={form.volunteerHasVehicle === 'no'}
                      onChange={() => setField('volunteerHasVehicle', 'no')}
                    />
                    {vol.vehicleNo}
                  </label>
                </div>
              </div>
            </div>
          )}

          {role === 'other' && (
            <div className="border-t border-gray-100 pt-8 space-y-4">
              <h3 className="text-lg font-light text-gray-900">{oth.sectionTitle}</h3>
              <FormHtml
                html={oth.introHtml}
                className="text-sm text-gray-600 font-light -mt-2"
                linkClassName={formHtmlLinkClass}
              />
              <div>
                <label htmlFor="gi-other" className={labelClass}>
                  {oth.detailsLabel}
                </label>
                <textarea
                  id="gi-other"
                  rows={5}
                  required
                  value={form.otherDetails}
                  onChange={(e) => setField('otherDetails', e.target.value)}
                  className={`${inputClass} resize-y`}
                  placeholder={oth.detailsPlaceholder}
                />
              </div>
            </div>
          )}

          {role !== 'other' && role !== 'yard-sign' && (
            <div className="border-t border-gray-100 pt-8 space-y-4">
              <label htmlFor="gi-notes" className={labelClass}>
                {sh.anythingElseLabel}
              </label>
              <textarea
                id="gi-notes"
                rows={3}
                value={form.additionalNotes}
                onChange={(e) => setField('additionalNotes', e.target.value)}
                className={`${inputClass} resize-y`}
                placeholder={sh.anythingElsePlaceholder}
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
            <span>{formCopy.consentText}</span>
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
        {isSubmitting ? sh.sendingLabel : formCopy.submitButton}
      </button>

      <p className="text-xs text-gray-500 font-light text-center leading-relaxed">
        {formCopy.footerPrefix}{' '}
        <Link href="/about#contact" className={linkClass}>
          {formCopy.footerLinkLabel}
        </Link>
        .
      </p>
    </form>
  )
}
