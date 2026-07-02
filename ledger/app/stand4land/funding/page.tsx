import FundingApplicationForm from '@/components/indigenous/FundingApplicationForm'
import { HubPage, HubPageIntro } from '@/components/indigenous/HubPage'
import { buildHubPageMetadata } from '@/lib/page-metadata'
import { hubPageTitle } from '@/lib/indigenous-hub'

export const metadata = buildHubPageMetadata(
  hubPageTitle('Apply for funding'),
  'Protect Ontario has very limited funds for Nation-led land and water defence campaigns. Tell us about your campaign if you are seeking support.'
)

export default function IndigenousFundingPage() {
  return (
    <HubPage>
      <HubPageIntro
        title="Apply for funding"
        eyebrow={
          <p className="text-xs uppercase tracking-[0.28em] text-[#1a4d3a] font-medium mb-3">Limited support</p>
        }
      >
        <div className="space-y-4 text-base sm:text-lg">
          <p>
            Protect Ontario has <strong className="font-normal text-[#142818]">very limited funding</strong> for
            Nation-led land and water defence campaigns. We cannot support every campaign — but for the right cause, at the
            right moment, we may be able to help.
          </p>
          <p>
            We prioritize requests that are clearly Nation-led, tied to land or water protection, and verifiable
            through official Nation or campaign channels. We do not collect donations on behalf of movements listed in
            this hub.
          </p>
        </div>
      </HubPageIntro>

      <FundingApplicationForm />
    </HubPage>
  )
}
