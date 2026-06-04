import { involvementRoles, volunteerRoleOptions, type InvolvementRole } from './get-involved'

export type FormRoleCopy = {
  id: InvolvementRole
  label: string
  description: string
}

export type VolunteerOptionCopy = {
  id: string
  label: string
}

export type GetInvolvedFormCopy = {
  version: 1
  rolesQuestion: string
  submitButton: string
  footerPrefix: string
  footerLinkLabel: string
  successTitle: string
  successBody: string
  consentText: string
  roles: FormRoleCopy[]
  volunteerOptions: VolunteerOptionCopy[]
}

export const defaultGetInvolvedFormCopy = (): GetInvolvedFormCopy => ({
  version: 1,
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
})

const ROLE_IDS: InvolvementRole[] = ['yard-sign', 'dropoff', 'volunteer', 'other']

export function parseGetInvolvedFormCopy(data: unknown): GetInvolvedFormCopy {
  const base = defaultGetInvolvedFormCopy()
  if (!data || typeof data !== 'object') return base
  const d = data as Record<string, unknown>

  const str = (key: keyof GetInvolvedFormCopy, fallback: string) =>
    typeof d[key] === 'string' && (d[key] as string).trim() ? (d[key] as string).trim() : fallback

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
        label: typeof row?.label === 'string' && row.label.trim() ? row.label.trim() : fallback.label,
        description:
          typeof row?.description === 'string' && row.description.trim()
            ? row.description.trim()
            : fallback.description,
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
        return {
          id: item.id,
          label:
            typeof item.label === 'string' && item.label.trim()
              ? item.label.trim()
              : fallback?.label ?? item.id,
        }
      })
    if (volunteerOptions.length === 0) volunteerOptions = base.volunteerOptions
  }

  return {
    version: 1,
    rolesQuestion: str('rolesQuestion', base.rolesQuestion),
    submitButton: str('submitButton', base.submitButton),
    footerPrefix: str('footerPrefix', base.footerPrefix),
    footerLinkLabel: str('footerLinkLabel', base.footerLinkLabel),
    successTitle: str('successTitle', base.successTitle),
    successBody: str('successBody', base.successBody),
    consentText: str('consentText', base.consentText),
    roles,
    volunteerOptions,
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
