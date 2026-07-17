'use client'

import { useCallback, useState } from 'react'
import TopNavigation from '@/components/TopNavigation'
import { facebookShareUrl } from '@/lib/flyer-share'
import {
  WILDFIRE_CAMPAIGN,
  confirmationMailto,
  deriveWildfireCampaign,
  formatCad,
  formatDonationDate,
  shareEmailHref,
  type WildfireCampaignConfig,
} from '@/lib/wildfire-campaign'

const sectionClass = 'scroll-mt-24'
const cardClass = 'rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm'
const h2Class = 'text-2xl sm:text-3xl font-light tracking-tight text-slate-900'
const bodyClass = 'text-slate-600 font-light leading-relaxed'
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d2b7a]'

function MilestoneTracker({
  communityTotal,
  milestones,
  nextMilestone,
  amountToNextMilestone,
}: {
  communityTotal: number
  milestones: number[]
  nextMilestone: number | null
  amountToNextMilestone: number | null
}) {
  const last = milestones[milestones.length - 1] ?? 5000
  // Visual scale grows with total; never caps the campaign — bar fills relative to next milestone band
  const visualMax = nextMilestone ?? Math.max(communityTotal * 1.15, last * 1.2)
  const fillPct = Math.min(100, Math.max(0, (communityTotal / visualMax) * 100))

  return (
    <div className="mt-8 space-y-4">
      <div
        className="h-3 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuemin={0}
        aria-valuenow={Math.round(communityTotal)}
        aria-valuemax={Math.round(visualMax)}
        aria-label={
          nextMilestone != null
            ? `Community total ${formatCad(communityTotal)}, next milestone ${formatCad(nextMilestone)}`
            : `Community total ${formatCad(communityTotal)}. Let's keep going.`
        }
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#2E4A6B] to-[#3d2b7a] transition-[width] duration-700 ease-out motion-reduce:transition-none"
          style={{ width: `${fillPct}%` }}
        />
      </div>

      <div className="flex flex-wrap gap-2" aria-hidden>
        {milestones.map((m) => {
          const reached = communityTotal >= m
          const isNext = nextMilestone === m
          return (
            <span
              key={m}
              className={`rounded-full px-3 py-1 text-xs font-medium border ${
                reached
                  ? 'bg-[#2E4A6B] text-white border-[#2E4A6B]'
                  : isNext
                    ? 'bg-violet-50 text-[#3d2b7a] border-violet-200'
                    : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              {formatCad(m)}
              {reached ? ' ✓' : isNext ? ' · next' : ''}
            </span>
          )
        })}
      </div>

      <p className={`${bodyClass} text-sm`}>
        {nextMilestone != null && amountToNextMilestone != null ? (
          <>
            Next community milestone: <strong className="font-medium text-slate-900">{formatCad(nextMilestone)}</strong>
            {' — '}
            {formatCad(amountToNextMilestone)} to go
          </>
        ) : (
          <>
            You&apos;ve passed every listed milestone. <strong className="font-medium text-slate-900">Let&apos;s keep going</strong> —
            every donation still adds to our community total.
          </>
        )}
      </p>
    </div>
  )
}

function ShareActions({ campaign }: { campaign: WildfireCampaignConfig }) {
  const [copied, setCopied] = useState(false)
  const pageUrl = campaign.canonicalUrl

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pageUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', pageUrl)
    }
  }, [pageUrl])

  const btnClass = `inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors ${focusRing}`

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={facebookShareUrl(pageUrl)}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClass}
      >
        Share on Facebook
      </a>
      <button type="button" onClick={() => void handleCopy()} className={btnClass}>
        {copied ? 'Link copied!' : 'Copy link'}
      </button>
      <a href={shareEmailHref(campaign)} className={btnClass}>
        Email
      </a>
    </div>
  )
}

export default function WildfireSupportPage() {
  const campaign = WILDFIRE_CAMPAIGN
  const derived = deriveWildfireCampaign(campaign)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900">
      <TopNavigation />

      {/* SECTION 1: HERO */}
      <header className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-950 via-[#152a45] to-[#1e3a5f] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-30 motion-reduce:opacity-20"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 20% 20%, rgba(61,43,122,0.45), transparent), radial-gradient(ellipse 60% 50% at 90% 80%, rgba(249,224,76,0.12), transparent)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 md:px-8 py-14 sm:py-20">
          <p className="text-xs uppercase tracking-[0.3em] text-[#f9e04c]/90 font-medium mb-4">
            Community Fundraiser
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight leading-tight">
            Help Support Namaygoosisagagun First Nation
          </h1>
          <div className={`mt-6 space-y-4 text-slate-200/95 text-base sm:text-lg ${bodyClass}`}>
            <p>
              Namaygoosisagagun First Nation has been displaced by wildfires and is raising funds to support emergency
              needs and community recovery.
            </p>
            <p>
              We are asking the Protect Ontario community to come together and contribute through the official
              fundraiser.
            </p>
            <p>
              Every contribution matters. Whether it is $5, $25, $100, or simply sharing this page, it helps expand the
              number of people supporting the community.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
            <a
              href={campaign.officialDonationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center rounded-xl bg-[#f9e04c] px-6 py-3.5 text-base font-semibold text-[#1a1a1a] hover:bg-[#f5d82e] transition-colors ${focusRing} focus-visible:outline-[#f9e04c]`}
            >
              Donate through the official fundraiser
            </a>
            <a
              href="#donation-confirmation"
              className={`text-sm text-slate-200/90 hover:text-white underline underline-offset-4 decoration-white/30 hover:decoration-white ${focusRing} rounded-sm`}
            >
              Already donated? Add your donation to our community total.
            </a>
          </div>
          <p className="mt-4 text-sm text-slate-300/90 font-light max-w-2xl">
            Your donation is completed directly through the Anishinabek Nation 7th Generation Charity website. Protect
            Ontario does not collect or handle the funds.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 md:px-8 py-12 sm:py-16 space-y-14 sm:space-y-16">
        {/* SECTION 2: COMMUNITY FUNDRAISING PROGRESS */}
        <section id="progress" className={sectionClass} aria-labelledby="progress-heading">
          <h2 id="progress-heading" className={h2Class}>
            How much can our community raise?
          </h2>
          <p className={`mt-3 ${bodyClass}`}>
            We are tracking donations made by members of the Protect Ontario community to show the collective impact we
            can make together.
          </p>

          <div className={`${cardClass} mt-8 border-[#2E4A6B]/15 bg-gradient-to-br from-white to-slate-50`}>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-medium">Community total</p>
            <p className="mt-2 text-4xl sm:text-5xl font-light tracking-tight text-[#152a45]">
              {formatCad(campaign.communityTotal)}{' '}
              <span className="text-lg sm:text-xl text-slate-500 font-light">raised by our community</span>
            </p>
            <p className="mt-3 text-base text-slate-600 font-light">
              <span className="font-medium text-slate-900">{campaign.donorCount}</span> community{' '}
              {campaign.donorCount === 1 ? 'donor' : 'donors'}
            </p>

            <MilestoneTracker
              communityTotal={campaign.communityTotal}
              milestones={campaign.milestones}
              nextMilestone={derived.nextMilestone}
              amountToNextMilestone={derived.amountToNextMilestone}
            />
          </div>
        </section>

        {/* SECTION 3: PERSONAL MATCH */}
        <section id="match" className={sectionClass} aria-labelledby="match-heading">
          <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-6 sm:p-8">
            <h2 id="match-heading" className="text-xl sm:text-2xl font-light tracking-tight text-[#3d2b7a]">
              The first {formatCad(campaign.matchMaximum)} is matched
            </h2>
            <div className={`mt-4 space-y-3 ${bodyClass} text-violet-950/85`}>
              <p>
                To help get the campaign started, Aazir is personally matching the first {formatCad(campaign.matchMaximum)}{' '}
                donated by the Protect Ontario community, dollar-for-dollar.
              </p>
              <p>
                This is one combined matching pool. The maximum personal matching contribution is{' '}
                {formatCad(campaign.matchMaximum)} in total, not {formatCad(campaign.matchMaximum)} for each donor.
              </p>
            </div>

            <ul className={`mt-5 space-y-2 text-sm ${bodyClass} text-violet-950/80 list-disc pl-5`}>
              <li>
                If the community donates $100, Aazir contributes $100.
              </li>
              <li>
                If the community donates {formatCad(campaign.matchMaximum)}, Aazir contributes the full{' '}
                {formatCad(campaign.matchMaximum)}.
              </li>
              <li>
                If the community donates $1,000, Aazir still contributes {formatCad(campaign.matchMaximum)}, bringing the
                combined total to {formatCad(1000 + campaign.matchMaximum)}.
              </li>
            </ul>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-white/80 border border-violet-100 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-slate-500">Community donations eligible for matching</p>
                <p className="mt-1 text-lg font-medium text-slate-900">
                  {formatCad(derived.personalMatch)} of the first {formatCad(campaign.matchMaximum)}
                </p>
              </div>
              <div className="rounded-xl bg-white/80 border border-violet-100 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-slate-500">Current personal match</p>
                <p className="mt-1 text-lg font-medium text-slate-900">
                  {formatCad(derived.personalMatch)} of {formatCad(campaign.matchMaximum)}
                </p>
              </div>
            </div>

            <div
              className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/80 border border-violet-100"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(derived.matchedProgress)}
              aria-label={`Matching progress ${Math.round(derived.matchedProgress)} percent`}
            >
              <div
                className="h-full rounded-full bg-[#3d2b7a] transition-[width] duration-700 ease-out motion-reduce:transition-none"
                style={{ width: `${derived.matchedProgress}%` }}
              />
            </div>

            {derived.matchUnlocked ? (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                <p className="text-sm font-semibold text-emerald-900">Match unlocked</p>
                <p className={`mt-1 text-sm ${bodyClass} text-emerald-900/90`}>
                  The Protect Ontario community has unlocked the full additional {formatCad(campaign.matchMaximum)}{' '}
                  contribution.
                </p>
                <p className={`mt-2 text-sm ${bodyClass} text-emerald-900/80`}>
                  The first {formatCad(campaign.matchMaximum)} was doubled, and every donation beyond that continues
                  adding to the community&apos;s total impact.
                </p>
              </div>
            ) : null}

            <div className="mt-6 space-y-2 text-sm">
              <p className={bodyClass}>
                Personal match pledged:{' '}
                <strong className="font-medium text-slate-900">{formatCad(campaign.matchMaximum)}</strong>
              </p>
              <p className={bodyClass}>
                Matching donation status:{' '}
                {campaign.matchCompleted ? (
                  <strong className="font-medium text-emerald-800">Matching donation completed ✓</strong>
                ) : (
                  <strong className="font-medium text-slate-900">Pending</strong>
                )}
              </p>
              {campaign.matchConfirmationUrl.trim() ? (
                <a
                  href={campaign.matchConfirmationUrl.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex text-[#3d2b7a] underline underline-offset-2 hover:text-[#2a1f58] ${focusRing} rounded-sm`}
                >
                  View matching donation confirmation
                </a>
              ) : null}
            </div>
          </div>
        </section>

        {/* SECTION 4: COLLECTIVE IMPACT */}
        <section id="impact" className={sectionClass} aria-labelledby="impact-heading">
          <h2 id="impact-heading" className={h2Class}>
            Our collective impact
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className={`${cardClass} sm:col-span-1 border-[#2E4A6B]/20`}>
              <p className="text-xs uppercase tracking-wider text-slate-500">Community donations</p>
              <p className="mt-2 text-3xl font-light text-[#152a45]">{formatCad(campaign.communityTotal)}</p>
            </div>
            <div className={`${cardClass} bg-slate-50`}>
              <p className="text-xs uppercase tracking-wider text-slate-500">Personal matching contribution</p>
              <p className="mt-2 text-2xl font-light text-slate-700">{formatCad(derived.personalMatch)}</p>
            </div>
            <div className={`${cardClass} bg-slate-50`}>
              <p className="text-xs uppercase tracking-wider text-slate-500">Combined impact</p>
              <p className="mt-2 text-2xl font-light text-slate-700">{formatCad(derived.combinedImpact)}</p>
            </div>
          </div>
        </section>

        {/* SECTION 5: WHY SUPPORT */}
        <section id="why" className={sectionClass} aria-labelledby="why-heading">
          <h2 id="why-heading" className={h2Class}>
            Why your support matters
          </h2>
          <div className={`mt-4 space-y-4 ${bodyClass}`}>
            <p>
              The official fundraiser is supporting Namaygoosisagagun First Nation during the wildfire emergency and the
              recovery that follows.
            </p>
            <p>Donating directly ensures the funds go through the organization coordinating the appeal.</p>
            <p>
              For complete and current details about the fundraiser and how donations will be used, visit the{' '}
              <a
                href={campaign.officialDonationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-[#3d2b7a] font-medium underline underline-offset-2 hover:text-[#2a1f58] ${focusRing} rounded-sm`}
              >
                official donation page
              </a>
              .
            </p>
          </div>
        </section>

        {/* SECTION 6: DONATION CONFIRMATION */}
        <section id="donation-confirmation" className={sectionClass} aria-labelledby="confirm-heading">
          <div className={cardClass}>
            <h2 id="confirm-heading" className={h2Class}>
              Already donated?
            </h2>
            <div className={`mt-4 space-y-4 ${bodyClass}`}>
              <p>Tell us how much you donated so we can include it in the Protect Ontario community total.</p>
              <p>
                You may remove or hide your address, payment details, receipt number, transaction ID, or any other
                personal information.
              </p>
              <p>We only need:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The donation amount</li>
                <li>Confirmation that it was donated through the official fundraiser</li>
                <li>Whether you would like your name displayed or listed as Anonymous</li>
              </ul>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {campaign.contactEmail.trim() ? (
                <a
                  href={confirmationMailto(campaign)}
                  className={`inline-flex items-center justify-center rounded-xl bg-[#3d2b7a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#2a1f58] transition-colors ${focusRing}`}
                >
                  Send your donation confirmation
                </a>
              ) : null}
              {campaign.confirmationFormUrl.trim() ? (
                <a
                  href={campaign.confirmationFormUrl.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors ${focusRing}`}
                >
                  Submit through the confirmation form
                </a>
              ) : null}
            </div>
          </div>
        </section>

        {/* SECTION 7: COMMUNITY DONATIONS */}
        {campaign.showDonorList ? (
          <section id="donors" className={sectionClass} aria-labelledby="donors-heading">
            <h2 id="donors-heading" className={h2Class}>
              Donations from our community
            </h2>
            {campaign.donations.length === 0 ? (
              <p className={`mt-4 ${bodyClass}`}>
                No community donations have been confirmed on this page yet. Be the first — donate through the official
                fundraiser, then{' '}
                <a href="#donation-confirmation" className={`text-[#3d2b7a] underline underline-offset-2 ${focusRing} rounded-sm`}>
                  add your confirmation
                </a>
                .
              </p>
            ) : (
              <ul className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                {campaign.donations.map((d, idx) => (
                  <li key={`${d.displayName}-${d.date}-${idx}`} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{d.displayName}</p>
                      <p className="text-sm text-slate-500 font-light">{formatDonationDate(d.date)}</p>
                    </div>
                    <p className="text-lg font-light text-[#152a45]">{formatCad(d.amount)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

        {/* SECTION 8: SHARE */}
        <section id="share" className={sectionClass} aria-labelledby="share-heading">
          <h2 id="share-heading" className={h2Class}>
            Help us reach more people
          </h2>
          <p className={`mt-3 ${bodyClass}`}>
            Not everyone can donate, but sharing the fundraiser can help it reach someone who can.
          </p>
          <p className={`mt-3 text-sm ${bodyClass} italic text-slate-500`}>
            {campaign.shareMessage}
          </p>
          <div className="mt-6">
            <ShareActions campaign={campaign} />
          </div>
        </section>

        {/* SECTION 9: TAX RECEIPTS */}
        <section id="receipts" className={sectionClass} aria-labelledby="receipts-heading">
          <h2 id="receipts-heading" className={h2Class}>
            Donation receipts
          </h2>
          <div className={`mt-4 space-y-3 ${bodyClass}`}>
            <p>
              Donations are made directly through the official charity&apos;s donation page. The official donation page
              states that charitable receipts are issued for donations.
            </p>
            <p>Donors should retain the receipt supplied by the charity or its donation provider.</p>
            <p>
              Protect Ontario does not issue donation receipts and cannot provide individual tax advice.
            </p>
          </div>
        </section>

        {/* SECTION 10: TRANSPARENCY */}
        <section id="how-it-works" className={sectionClass} aria-labelledby="how-heading">
          <h2 id="how-heading" className={h2Class}>
            How this campaign works
          </h2>
          <ol className="mt-6 space-y-5">
            {[
              {
                title: 'Donate directly',
                body: 'All donations are made through the official fundraiser. Protect Ontario does not collect the money.',
              },
              {
                title: 'Report your donation',
                body: 'Donors may privately send confirmation so their amount can be added to the community total.',
              },
              {
                title: 'Follow our progress',
                body: 'The community total, matching amount, and matching-donation status will be updated on this page.',
              },
            ].map((item, i) => (
              <li key={item.title} className="flex gap-4">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#152a45] text-sm font-medium text-white"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-medium text-slate-900">{item.title}</h3>
                  <p className={`mt-1 ${bodyClass}`}>{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* SECTION 11: DISCLAIMER */}
        <section
          id="disclaimer"
          className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-6 sm:px-6 text-sm text-slate-600 font-light leading-relaxed"
          aria-label="Campaign disclaimer"
        >
          <p>
            This is an independent community fundraising initiative hosted by Protect Ontario. It is not an official
            page of Namaygoosisagagun First Nation, the Anishinabek Nation, or the Anishinabek Nation 7th Generation
            Charity.
          </p>
          <p className="mt-3">Donations are completed directly through the official charity website.</p>
        </section>

        {/* Sticky-feeling final CTA */}
        <div className="rounded-2xl bg-gradient-to-br from-[#152a45] to-[#2E4A6B] px-6 py-8 text-center text-white">
          <p className="text-lg sm:text-xl font-light">Ready to contribute?</p>
          <a
            href={campaign.officialDonationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-4 inline-flex items-center justify-center rounded-xl bg-[#f9e04c] px-6 py-3.5 text-base font-semibold text-[#1a1a1a] hover:bg-[#f5d82e] transition-colors ${focusRing} focus-visible:outline-[#f9e04c]`}
          >
            Donate through the official fundraiser
          </a>
        </div>
      </main>
    </div>
  )
}
