export type InvolvementRole =
  | 'yard-sign'
  | 'dropoff'
  | 'volunteer'
  | 'updates'

/** Set true to show yard-sign on /get-involved (checkout handles orders for now). */
export const SHOW_YARD_SIGN_ROLE = false

export const involvementRoles: {
  id: InvolvementRole
  label: string
  description: string
}[] = [
  {
    id: 'yard-sign',
    label: 'Request a yard sign',
    description: 'Printed 18 × 24 in with a stand—delivered by volunteers in your area.',
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
    id: 'updates',
    label: 'Stay in the loop',
    description: 'Get occasional updates on protests, signs, and accountability work.',
  },
]

export const visibleInvolvementRoles = involvementRoles.filter(
  (r) => SHOW_YARD_SIGN_ROLE || r.id !== 'yard-sign'
)

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
  yardSignPaymentStatus: YardSignPaymentStatus | ''
  yardSignNotes: string
  dropoffLocation: string
  dropoffAvailability: string
  dropoffCapacity: string
  dropoffListPublicly: 'yes' | 'no' | ''
  volunteerRoles: string[]
  volunteerAvailability: string
  volunteerHasVehicle: 'yes' | 'no' | ''
  updatesTopics: string[]
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
  yardSignQuantity: '1',
  yardSignPaymentStatus: '',
  yardSignNotes: '',
  dropoffLocation: '',
  dropoffAvailability: '',
  dropoffCapacity: '',
  dropoffListPublicly: '',
  volunteerRoles: [],
  volunteerAvailability: '',
  volunteerHasVehicle: '',
  updatesTopics: [],
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

export const updatesTopicOptions = [
  { id: 'protests', label: 'Protests & rallies' },
  { id: 'signs', label: 'Yard signs & materials' },
  { id: 'policy', label: 'Policy & public accountability' },
] as const

/** Flat payload for Google Apps Script `e.parameter` (URL-encoded POST). */
export function buildGetInvolvedSubmitPayload(state: GetInvolvedFormState): Record<string, string> {
  const roleLabel = involvementRoles.find((r) => r.id === state.role)?.label ?? state.role

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
    yard_sign_notes: state.yardSignNotes.trim(),
    dropoff_location: state.dropoffLocation.trim(),
    dropoff_availability: state.dropoffAvailability.trim(),
    dropoff_capacity: state.dropoffCapacity.trim(),
    dropoff_list_publicly: state.dropoffListPublicly,
    volunteer_roles: state.volunteerRoles.join(', '),
    volunteer_availability: state.volunteerAvailability.trim(),
    volunteer_has_vehicle: state.volunteerHasVehicle,
    updates_topics: state.updatesTopics.join(', '),
    additional_notes: state.additionalNotes.trim(),
    source_page: 'get-involved',
  }
}

export function getInvolvedSubmitUrl(): string {
  return (process.env.NEXT_PUBLIC_GET_INVOLVED_SUBMIT_URL || '').trim()
}
