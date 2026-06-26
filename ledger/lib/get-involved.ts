import { formatPostalCodeDisplay, normalizePostalCode } from './postal-code'

export const PROTECT_ONTARIO_DONATE_URL = 'https://buy.stripe.com/9B614n0UY3CtdbQ5CM4gg00'

export type InvolvementRole = 'yard-sign' | 'dropoff' | 'volunteer' | 'other'

export const involvementRoles: {
  id: InvolvementRole
  label: string
  description: string
}[] = [
  {
    id: 'yard-sign',
    label: 'I want a sign',
    description: 'Request a Ford Failed You yard sign—we’ll follow up about size and local delivery.',
  },
  {
    id: 'dropoff',
    label: 'Host a drop-off / pickup point',
    description: 'Store signs briefly so neighbours can pick up or receive deliveries.',
  },
  {
    id: 'volunteer',
    label: 'Volunteer',
    description: 'Help with delivery, events, outreach, or other organizer tasks.',
  },
  {
    id: 'other',
    label: 'Something else',
    description: 'None of the above? Tell us what you have in mind—we’ll figure it out.',
  },
]

export type YardSignSize = '24x18' | '12x16' | 'any'
export type YardSignPaymentStatus = 'paid' | 'not-yet' | 'need-help'

export const yardSignSizeLabels: Record<YardSignSize, string> = {
  '24x18': '24" × 18"',
  '12x16': '12" × 16"',
  any: 'Any size',
}

export type GetInvolvedFormState = {
  role: InvolvementRole | ''
  name: string
  email: string
  phone: string
  city: string
  postalCode: string
  yardSignSize: YardSignSize | ''
  yardSignQuantity: string
  yardSignDeliveryAddress: string
  yardSignPaymentStatus: YardSignPaymentStatus | ''
  yardSignNotes: string
  dropoffLocation: string
  dropoffAvailability: string
  dropoffCapacity: string
  dropoffListPublicly: 'yes' | 'no' | ''
  volunteerRoles: string[]
  volunteerAvailability: string
  volunteerHasVehicle: 'yes' | 'no' | ''
  otherDetails: string
  additionalNotes: string
  consent: boolean
}

export const emptyGetInvolvedFormState: GetInvolvedFormState = {
  role: '',
  name: '',
  email: '',
  phone: '',
  city: '',
  postalCode: '',
  yardSignSize: '',
  yardSignQuantity: '',
  yardSignDeliveryAddress: '',
  yardSignPaymentStatus: '',
  yardSignNotes: '',
  dropoffLocation: '',
  dropoffAvailability: '',
  dropoffCapacity: '',
  dropoffListPublicly: '',
  volunteerRoles: [],
  volunteerAvailability: '',
  volunteerHasVehicle: '',
  otherDetails: '',
  additionalNotes: '',
  consent: false,
}

export const volunteerRoleOptions = [
  { id: 'delivery', label: 'Sign delivery or pickup runs' },
  { id: 'events', label: 'Events & rallies (tabling, outreach)' },
  { id: 'printing', label: 'Printing / materials prep' },
  { id: 'coordination', label: 'Local coordination (email, matching)' },
  { id: 'social', label: 'Social media or graphics' },
  { id: 'other', label: 'Other (describe below)' },
] as const

export type GetInvolvedSubmitOptions = {
  sourcePage?: string
}

/** Flat payload for Google Apps Script `e.parameter` (URL-encoded POST). */
export function buildGetInvolvedSubmitPayload(
  state: GetInvolvedFormState,
  options: GetInvolvedSubmitOptions = {},
  roles: { id: InvolvementRole; label: string }[] = involvementRoles
): Record<string, string> {
  const roleLabel = roles.find((r) => r.id === state.role)?.label ?? state.role
  const notes =
    state.role === 'other' ? state.otherDetails.trim() : state.additionalNotes.trim()
  const sizeLabel = state.yardSignSize ? yardSignSizeLabels[state.yardSignSize] : ''

  return {
    submitted_at: new Date().toISOString(),
    role: state.role,
    role_label: roleLabel,
    name: state.name.trim(),
    email: state.email.trim(),
    phone: state.phone.trim(),
    city: state.city.trim(),
    postal_code: (() => {
      const parsed = normalizePostalCode(state.postalCode)
      return parsed.kind !== 'unknown'
        ? formatPostalCodeDisplay(parsed)
        : state.postalCode.trim()
    })(),
    yard_sign_size: sizeLabel,
    /** Kept for existing Google Sheet column; same value as yard_sign_size */
    yard_sign_design: sizeLabel,
    yard_sign_quantity: state.yardSignQuantity,
    yard_sign_payment_status: state.yardSignPaymentStatus,
    yard_sign_notes: [state.yardSignDeliveryAddress.trim(), state.yardSignNotes.trim()]
      .filter(Boolean)
      .join(' | '),
    dropoff_location: state.dropoffLocation.trim(),
    dropoff_availability: state.dropoffAvailability.trim(),
    dropoff_capacity: state.dropoffCapacity.trim(),
    dropoff_list_publicly: state.dropoffListPublicly,
    volunteer_roles: state.volunteerRoles.join(', '),
    volunteer_availability: state.volunteerAvailability.trim(),
    volunteer_has_vehicle: state.volunteerHasVehicle,
    updates_topics: '',
    additional_notes: notes,
    source_page: options.sourcePage ?? 'get-involved',
  }
}

export function getInvolvedSubmitUrl(): string {
  return (process.env.NEXT_PUBLIC_GET_INVOLVED_SUBMIT_URL || '').trim()
}

export type GetInvolvedClientConfig = {
  submitViaApi: boolean
  sheetSubmitUrl: string
}

/** Prefer server submit (Sheet + Resend email); else direct Google Apps Script URL. */
export async function loadGetInvolvedClientConfig(): Promise<GetInvolvedClientConfig> {
  const builtIn = getInvolvedSubmitUrl()
  if (builtIn) {
    return { submitViaApi: false, sheetSubmitUrl: builtIn }
  }

  for (const path of ['/protectont-config.json', '/api/protectont-config']) {
    try {
      const res = await fetch(path)
      if (!res.ok) continue
      const data = (await res.json()) as {
        getInvolvedSubmitUrl?: string
        submitViaApi?: boolean
      }
      if (data.submitViaApi) {
        return {
          submitViaApi: true,
          sheetSubmitUrl: (data.getInvolvedSubmitUrl || '').trim(),
        }
      }
      const url = (data.getInvolvedSubmitUrl || '').trim()
      if (url) return { submitViaApi: false, sheetSubmitUrl: url }
    } catch {
      /* try next source */
    }
  }
  return { submitViaApi: false, sheetSubmitUrl: '' }
}
