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
    description: 'Request a yard sign for your area—we’ll follow up about design and local delivery.',
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

export type YardSignDesign = 'design-1' | 'design-2' | 'either'
export type YardSignPaymentStatus = 'paid' | 'not-yet' | 'need-help'

export type GetInvolvedFormState = {
  role: InvolvementRole | ''
  name: string
  email: string
  phone: string
  city: string
  postalCode: string
  yardSignDesign: YardSignDesign | ''
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
  yardSignDesign: '',
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

/** Flat payload for Google Apps Script `e.parameter` (URL-encoded POST). */
export function buildGetInvolvedSubmitPayload(state: GetInvolvedFormState): Record<string, string> {
  const roleLabel = involvementRoles.find((r) => r.id === state.role)?.label ?? state.role
  const notes =
    state.role === 'other' ? state.otherDetails.trim() : state.additionalNotes.trim()

  return {
    submitted_at: new Date().toISOString(),
    role: state.role,
    role_label: roleLabel,
    name: state.name.trim(),
    email: state.email.trim(),
    phone: state.phone.trim(),
    city: state.city.trim(),
    postal_code: state.postalCode.trim(),
    yard_sign_design: state.yardSignDesign,
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
    source_page: 'get-involved',
  }
}

export function getInvolvedSubmitUrl(): string {
  return (process.env.NEXT_PUBLIC_GET_INVOLVED_SUBMIT_URL || '').trim()
}
