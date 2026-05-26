/** Paths shared with /join — keep labels in sync with FfGetInvolvedPage quick actions */
export const JOIN_PATHS = [
  { id: 'signs', label: 'Signs', subtitle: 'Order or download artwork', href: '/join#signs' },
  { id: 'pickup-hub', label: 'Sign Pickup Hub', subtitle: 'Host a local pickup point', href: '/join#pickup-hub' },
  { id: 'volunteer', label: 'Volunteer', subtitle: 'Deliveries, outreach & events', href: '/join#volunteer' },
  { id: 'donations', label: 'Donations', subtitle: 'Support the campaign', href: '/join#donations' },
  { id: 'other', label: 'Other', subtitle: 'Ideas, connections, skills', href: '/join#other' },
] as const
