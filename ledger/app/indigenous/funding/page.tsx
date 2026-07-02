import FundingApplicationForm from '@/components/indigenous/FundingApplicationForm'
import { buildPageMetadata } from '@/lib/page-metadata'

export const metadata = buildPageMetadata(
  'Apply for funding — Indigenous Land & Water Hub',
  'Protect Ontario has very limited funds for Indigenous-led land and water defence. Tell us about your campaign if you are seeking support.'
)

export default function IndigenousFundingPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 max-w-3xl mx-auto">
      <header className="mb-8 md:mb-10">
        <p className="text-xs uppercase tracking-[0.28em] text-[#1a4d3a] font-medium mb-3">Limited support</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#142818] leading-tight">
          Apply for funding
        </h1>
        <div className="mt-5 space-y-4 text-[#3d5c48] font-light leading-relaxed text-base sm:text-lg">
          <p>
            Protect Ontario has <strong className="font-normal text-[#142818]">very limited funding</strong> for
            Indigenous-led land and water defence. We cannot support every campaign — but for the right cause, at the
            right moment, we may be able to help.
          </p>
          <p>
            We prioritize requests that are clearly Indigenous-led, tied to land or water protection, and verifiable
            through official Nation or campaign channels. We do not collect donations on behalf of movements listed in
            this hub.
          </p>
        </div>
      </header>

      <FundingApplicationForm />
    </div>
  )
}
