import Link from 'next/link'
import OrganizationSubmissionForm from '@/components/indigenous/OrganizationSubmissionForm'
import HubBreadcrumbs from '@/components/indigenous/HubBreadcrumbs'
import { HubPage, HubPageIntro } from '@/components/indigenous/HubPage'
import { indigenousHubPath, hubPageTitle } from '@/lib/indigenous-hub'
import { buildHubPageMetadata } from '@/lib/page-metadata'

export const metadata = buildHubPageMetadata(
  hubPageTitle('Suggest an organization'),
  'Nominate a Nation-led or Nation-supporting organization for review before it is added to the Standing for the Land directory.'
)

export default function OrganizationSubmitPage() {
  return (
    <HubPage>
      <HubBreadcrumbs
        items={[
          { label: 'Home', href: indigenousHubPath('') },
          { label: 'Organizations', href: indigenousHubPath('organizations') },
          { label: 'Suggest an organization' },
        ]}
      />
      <HubPageIntro title="Suggest an organization">
        <div className="space-y-4">
          <p>
            Know a Nation-led group or trusted advocate that should be in this directory? Submit it here. We
            review every suggestion before publishing — listings must link to official channels only.
          </p>
          <p className="text-base">
            We do not add organizations we cannot verify. Duplicate or incomplete submissions may not receive a reply.
          </p>
        </div>
      </HubPageIntro>

      <OrganizationSubmissionForm />

      <p className="mt-8 text-sm text-[var(--hub-land-muted)]">
        <Link href={indigenousHubPath('organizations')} className="text-[var(--hub-land-forest)] hover:underline">
          ← Back to organizations
        </Link>
      </p>
    </HubPage>
  )
}
