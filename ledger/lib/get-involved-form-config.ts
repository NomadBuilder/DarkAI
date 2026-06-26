import { involvementRoles, volunteerRoleOptions, type InvolvementRole } from './get-involved'
import {
  defaultSuccessYardSignHtml,
  defaultYardSignIntroHtml,
  legacySuccessYardSignHtml,
  legacyYardSignIntroHtml,
} from './form-html'

export type FormRoleCopy = {
  id: InvolvementRole
  label: string
  description: string
}

export type VolunteerOptionCopy = {
  id: string
  label: string
}

export type SelectOptionCopy = {
  value: string
  label: string
}

export type ContactCopy = {
  detailsTitleSign: string
  detailsTitleOther: string
  nameLabel: string
  namePlaceholder: string
  emailLabel: string
  emailPlaceholder: string
  phoneLabel: string
  phoneRecommended: string
  phonePlaceholderSign: string
  phonePlaceholderOther: string
  cityLabel: string
  cityPlaceholder: string
  postalLabel: string
  postalPlaceholder: string
}

export type YardSignCopy = {
  sectionTitle: string
  /** HTML intro with links — use &lt;a href="/products"&gt; and mailto: links */
  introHtml: string
  deliveryAddressLabel: string
  deliveryAddressPlaceholder: string
  quantityLabel: string
  quantityPlaceholder: string
  quantityOptions: SelectOptionCopy[]
  sizeLabel: string
  sizePlaceholder: string
  sizeOptions: SelectOptionCopy[]
  paymentLabel: string
  paymentPaidLabel: string
  paymentNotYetLabel: string
  deliveryNotesLabel: string
  deliveryNotesPlaceholder: string
}

export type DropoffCopy = {
  sectionTitle: string
  locationLabel: string
  locationPlaceholder: string
  availabilityLabel: string
  availabilityPlaceholder: string
  capacityLabel: string
  capacityPlaceholder: string
  listPubliclyLabel: string
  listPubliclyYes: string
  listPubliclyNo: string
}

export type VolunteerSectionCopy = {
  sectionTitle: string
  rolesLabel: string
  availabilityLabel: string
  availabilityPlaceholder: string
  vehicleLabel: string
  vehicleYes: string
  vehicleNo: string
}

export type OtherSectionCopy = {
  sectionTitle: string
  introHtml: string
  detailsLabel: string
  detailsPlaceholder: string
}

export type SharedCopy = {
  anythingElseLabel: string
  anythingElsePlaceholder: string
  submitAnotherLabel: string
  sendingLabel: string
}

export type SuccessYardSignCopy = {
  bodyHtml: string
}

export type ValidationCopy = {
  chooseRole: string
  name: string
  email: string
  consent: string
  phoneSign: string
  city: string
  postalSign: string
  deliveryAddress: string
  signSize: string
  signQuantity: string
  signPayment: string
  otherDetails: string
  dropoffLocation: string
  dropoffAvailability: string
  dropoffListPublicly: string
  volunteerRoles: string
  volunteerAvailability: string
}

export type ErrorsCopy = {
  unavailable: string
  loading: string
  submitFailed: string
}

export type GetInvolvedFormCopy = {
  version: 3
  rolesQuestion: string
  submitButton: string
  footerPrefix: string
  footerLinkLabel: string
  successTitle: string
  successBody: string
  consentText: string
  roles: FormRoleCopy[]
  volunteerOptions: VolunteerOptionCopy[]
  contact: ContactCopy
  yardSign: YardSignCopy
  dropoff: DropoffCopy
  volunteer: VolunteerSectionCopy
  other: OtherSectionCopy
  shared: SharedCopy
  successYardSign: SuccessYardSignCopy
  validation: ValidationCopy
  errors: ErrorsCopy
}

function mergeStr(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function mergeSelectOptions(value: unknown, fallback: SelectOptionCopy[]): SelectOptionCopy[] {
  if (!Array.isArray(value) || value.length === 0) return fallback
  const parsed = value
    .filter((o) => o && typeof o === 'object' && typeof (o as { value?: string }).value === 'string')
    .map((o) => {
      const item = o as { value: string; label?: string }
      const fb = fallback.find((x) => x.value === item.value)
      return {
        value: item.value,
        label: mergeStr(item.label, fb?.label ?? item.value),
      }
    })
  return parsed.length > 0 ? parsed : fallback
}

export const defaultGetInvolvedFormCopy = (): GetInvolvedFormCopy => ({
  version: 3,
  rolesQuestion: 'How do you want to get involved? *',
  submitButton: 'Submit sign-up',
  footerPrefix: 'Rallies and corrections: use the',
  footerLinkLabel: 'About contact form',
  successTitle: 'Thank you',
  successBody:
    'We received your sign-up. A volunteer will follow up by email when we can match you locally.',
  consentText:
    'I agree that Protect Ontario volunteers may contact me about this sign-up. My details are used only for organizing—not sold to third parties. *',
  roles: involvementRoles.map((r) => ({
    id: r.id,
    label: r.label,
    description: r.description,
  })),
  volunteerOptions: volunteerRoleOptions.map((o) => ({ id: o.id, label: o.label })),
  contact: {
    detailsTitleSign: 'Your details',
    detailsTitleOther: 'Your contact info',
    nameLabel: 'Full name *',
    namePlaceholder: 'Your name',
    emailLabel: 'Email *',
    emailPlaceholder: 'you@example.com',
    phoneLabel: 'Phone',
    phoneRecommended: ' (recommended)',
    phonePlaceholderSign: 'For delivery coordination',
    phonePlaceholderOther: 'Optional',
    cityLabel: 'City / community *',
    cityPlaceholder: 'e.g. Toronto, Ottawa, Hamilton',
    postalLabel: 'Postal code',
    postalPlaceholder: 'e.g. M5V 1A1',
  },
  yardSign: {
    sectionTitle: 'Sign request',
    introHtml: defaultYardSignIntroHtml,
    deliveryAddressLabel: 'Where you live / delivery address *',
    deliveryAddressPlaceholder: 'Street address, intersection, or clear directions for drop-off',
    quantityLabel: 'How many signs? *',
    quantityPlaceholder: 'Select quantity',
    quantityOptions: [
      { value: '1', label: '1' },
      { value: '2', label: '2' },
      { value: '3', label: '3' },
      { value: '4+', label: '4 or more' },
    ],
    sizeLabel: 'Size *',
    sizePlaceholder: 'Select a size',
    sizeOptions: [
      { value: '24x18', label: '24" × 18"' },
      { value: '12x16', label: '12" × 16"' },
      { value: 'any', label: 'Any size' },
    ],
    paymentLabel: 'Payment *',
    paymentPaidLabel: 'I already paid $10 per sign (Products, Stripe, or e-transfer)',
    paymentNotYetLabel: 'Not yet — I will pay on Products, Stripe, or e-transfer',
    deliveryNotesLabel: 'Delivery notes (optional)',
    deliveryNotesPlaceholder: 'Porch vs apartment, best times, etc.',
  },
  dropoff: {
    sectionTitle: 'Drop-off / pickup point',
    locationLabel: 'Address or area you can serve *',
    locationPlaceholder:
      'Neighbourhood, intersection, or full address if you are comfortable sharing',
    availabilityLabel: 'When are you usually available? *',
    availabilityPlaceholder: 'e.g. Weekday evenings, Saturday mornings, flexible',
    capacityLabel: 'Roughly how many signs can you store at once?',
    capacityPlaceholder: 'e.g. 5–10 in a garage',
    listPubliclyLabel: 'May we list your area publicly for neighbours? *',
    listPubliclyYes: 'Yes — general area only',
    listPubliclyNo: 'No — coordinate privately',
  },
  volunteer: {
    sectionTitle: 'Volunteer',
    rolesLabel: 'What can you help with? *',
    availabilityLabel: 'General availability *',
    availabilityPlaceholder: 'Hours per week, days, or specific dates',
    vehicleLabel: 'Do you have a vehicle for local runs?',
    vehicleYes: 'Yes',
    vehicleNo: 'No',
  },
  other: {
    sectionTitle: 'Something else',
    introHtml:
      "<p>Weird idea? Partnership? Something we didn't list? Put it here—we read everything.</p>",
    detailsLabel: 'What do you need? *',
    detailsPlaceholder: 'Describe your request in a few sentences…',
  },
  shared: {
    anythingElseLabel: 'Anything else?',
    anythingElsePlaceholder: 'Optional',
    submitAnotherLabel: 'Submit another sign-up',
    sendingLabel: 'Sending…',
  },
  successYardSign: {
    bodyHtml: defaultSuccessYardSignHtml,
  },
  validation: {
    chooseRole: 'Please choose how you want to get involved.',
    name: 'Please enter your name.',
    email: 'Please enter your email.',
    consent: 'Please confirm you agree to be contacted.',
    phoneSign: 'Please enter a phone number so we can arrange delivery.',
    city: 'Please enter your city or community.',
    postalSign: 'Please enter your postal code.',
    deliveryAddress: 'Please tell us where you live / where we should deliver the sign(s).',
    signSize: 'Please choose a sign size.',
    signQuantity: 'Please tell us how many signs you need.',
    signPayment: 'Please tell us if you have paid yet ($10 per sign).',
    otherDetails: 'Please describe what you’re looking for.',
    dropoffLocation: 'Please describe where you can host pickup or drop-off.',
    dropoffAvailability: 'Please share when you are usually available.',
    dropoffListPublicly: 'Please say whether we may list your area publicly.',
    volunteerRoles: 'Please select at least one way you can help.',
    volunteerAvailability: 'Please share your general availability.',
  },
  errors: {
    unavailable:
      'Sign-up is temporarily unavailable. Please try again later or use the About contact form.',
    loading: 'Still loading—please try again in a moment.',
    submitFailed:
      'Something went wrong sending your sign-up. Please try again in a moment, or email the organizers listed on About.',
  },
})

const ROLE_IDS: InvolvementRole[] = ['yard-sign', 'dropoff', 'volunteer', 'other']

function mergeSection<T extends object>(value: unknown, fallback: T, keys: (keyof T)[]): T {
  const src = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const out = { ...fallback }
  for (const key of keys) {
    const fb = fallback[key]
    const v = src[key as string]
    if (typeof fb === 'string') {
      ;(out as Record<string, unknown>)[key as string] = mergeStr(v, fb)
    }
  }
  return out
}

export function parseGetInvolvedFormCopy(data: unknown): GetInvolvedFormCopy {
  const base = defaultGetInvolvedFormCopy()
  if (!data || typeof data !== 'object') return base
  const d = data as Record<string, unknown>

  let roles = base.roles
  if (Array.isArray(d.roles)) {
    const parsed: FormRoleCopy[] = []
    for (const id of ROLE_IDS) {
      const row = d.roles.find(
        (r) => r && typeof r === 'object' && (r as { id?: string }).id === id
      ) as { label?: string; description?: string } | undefined
      const fallback = base.roles.find((r) => r.id === id)!
      parsed.push({
        id,
        label: mergeStr(row?.label, fallback.label),
        description: mergeStr(row?.description, fallback.description),
      })
    }
    roles = parsed
  }

  let volunteerOptions = base.volunteerOptions
  if (Array.isArray(d.volunteerOptions)) {
    volunteerOptions = d.volunteerOptions
      .filter((o) => o && typeof o === 'object' && typeof (o as { id?: string }).id === 'string')
      .map((o) => {
        const item = o as { id: string; label?: string }
        const fallback = base.volunteerOptions.find((x) => x.id === item.id)
        return { id: item.id, label: mergeStr(item.label, fallback?.label ?? item.id) }
      })
    if (volunteerOptions.length === 0) volunteerOptions = base.volunteerOptions
  }

  const ys = d.yardSign
  const ysObj = ys && typeof ys === 'object' ? (ys as Record<string, unknown>) : {}
  const introHtml =
    typeof ysObj.introHtml === 'string' && ysObj.introHtml.trim()
      ? ysObj.introHtml.trim()
      : legacyYardSignIntroHtml({
          introPrefix: mergeStr(
            ysObj.introPrefix,
            '$10 per sign, delivered by volunteers—not shipped by mail. Pay on '
          ),
          productsLinkLabel: mergeStr(ysObj.productsLinkLabel, 'Products'),
          introMiddle: mergeStr(ysObj.introMiddle, ' or via e-transfer to '),
          paymentEmail: mergeStr(ysObj.paymentEmail, 'FIGHT_FORD_SIGNS@outlook.com'),
          introSuffix: mergeStr(ysObj.introSuffix, " (preferred) when you're ready."),
        })

  const yardSign: YardSignCopy = {
    ...mergeSection(ys, base.yardSign, [
      'sectionTitle',
      'deliveryAddressLabel',
      'deliveryAddressPlaceholder',
      'quantityLabel',
      'quantityPlaceholder',
      'sizeLabel',
      'sizePlaceholder',
      'paymentLabel',
      'paymentPaidLabel',
      'paymentNotYetLabel',
      'deliveryNotesLabel',
      'deliveryNotesPlaceholder',
    ] as (keyof YardSignCopy)[]),
    introHtml,
    quantityOptions: mergeSelectOptions(
      ys && typeof ys === 'object' ? (ys as { quantityOptions?: unknown }).quantityOptions : undefined,
      base.yardSign.quantityOptions
    ),
    sizeOptions: mergeSelectOptions(
      ys && typeof ys === 'object' ? (ys as { sizeOptions?: unknown }).sizeOptions : undefined,
      base.yardSign.sizeOptions
    ),
  }

  const otherRaw = d.other
  const otherObj = otherRaw && typeof otherRaw === 'object' ? (otherRaw as Record<string, unknown>) : {}
  const otherIntroHtml =
    typeof otherObj.introHtml === 'string' && otherObj.introHtml.trim()
      ? otherObj.introHtml.trim()
      : typeof otherObj.intro === 'string' && otherObj.intro.trim()
        ? `<p>${otherObj.intro.trim()}</p>`
        : base.other.introHtml

  const sy = d.successYardSign
  const syObj = sy && typeof sy === 'object' ? (sy as Record<string, unknown>) : {}
  const successBodyHtml =
    typeof syObj.bodyHtml === 'string' && syObj.bodyHtml.trim()
      ? syObj.bodyHtml.trim()
      : legacySuccessYardSignHtml({
          prefix: mergeStr(syObj.prefix, ''),
          productsLinkLabel: mergeStr(syObj.productsLinkLabel, 'Products'),
          middle: mergeStr(syObj.middle, ', Stripe checkout, or e-transfer to '),
          paymentEmail: mergeStr(syObj.paymentEmail, 'FIGHT_FORD_SIGNS@outlook.com'),
          suffix: mergeStr(syObj.suffix, " when you're ready."),
        })

  return {
    version: 3,
    rolesQuestion: mergeStr(d.rolesQuestion, base.rolesQuestion),
    submitButton: mergeStr(d.submitButton, base.submitButton),
    footerPrefix: mergeStr(d.footerPrefix, base.footerPrefix),
    footerLinkLabel: mergeStr(d.footerLinkLabel, base.footerLinkLabel),
    successTitle: mergeStr(d.successTitle, base.successTitle),
    successBody: mergeStr(d.successBody, base.successBody),
    consentText: mergeStr(d.consentText, base.consentText),
    roles,
    volunteerOptions,
    contact: mergeSection(d.contact, base.contact, Object.keys(base.contact) as (keyof ContactCopy)[]),
    yardSign,
    dropoff: mergeSection(d.dropoff, base.dropoff, Object.keys(base.dropoff) as (keyof DropoffCopy)[]),
    volunteer: mergeSection(
      d.volunteer,
      base.volunteer,
      Object.keys(base.volunteer) as (keyof VolunteerSectionCopy)[]
    ),
    other: {
      ...mergeSection(otherRaw, base.other, [
        'sectionTitle',
        'detailsLabel',
        'detailsPlaceholder',
      ] as (keyof OtherSectionCopy)[]),
      introHtml: otherIntroHtml,
    },
    shared: mergeSection(d.shared, base.shared, Object.keys(base.shared) as (keyof SharedCopy)[]),
    successYardSign: { bodyHtml: successBodyHtml },
    validation: mergeSection(
      d.validation,
      base.validation,
      Object.keys(base.validation) as (keyof ValidationCopy)[]
    ),
    errors: mergeSection(d.errors, base.errors, Object.keys(base.errors) as (keyof ErrorsCopy)[]),
  }
}

export function serializeGetInvolvedFormCopy(copy: GetInvolvedFormCopy): string {
  return JSON.stringify(copy, null, 2) + '\n'
}

export async function loadGetInvolvedFormCopy(): Promise<GetInvolvedFormCopy> {
  const paths = ['/data/get-involved-form.json', '/api/protectont/get-involved-form']
  for (const path of paths) {
    try {
      const res = await fetch(path, { cache: 'no-store' })
      if (!res.ok) continue
      return parseGetInvolvedFormCopy(await res.json())
    } catch {
      /* try next */
    }
  }
  return defaultGetInvolvedFormCopy()
}
