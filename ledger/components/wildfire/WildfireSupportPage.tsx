'use client'

import { useCallback, useEffect, useState } from 'react'
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
import { loadWildfireCampaign } from '@/lib/wildfire-campaign-store'

const sectionClass = 'scroll-mt-24'
const cardClass = 'rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm'
const h2Class = 'text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900'
const bodyClass = 'text-slate-700 leading-relaxed'
const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3d2b7a]'

function DonateButton({
  href,
  className = '',
  children = 'Donate now — official fundraiser',
}: {
  href: string
  className?: string
  children?: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#9f1239] to-[#7f1230] px-6 py-3.5 text-base font-bold text-white shadow-md hover:opacity-95 transition-opacity ${focusRing} ${className}`}
    >
      {children}
    </a>
  )
}

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
  const visualMax = nextMilestone ?? Math.max(communityTotal * 1.15, last * 1.2)
  const fillPct = Math.min(100, Math.max(0, (communityTotal / visualMax) * 100))

  return (
    <div className="mt-6 space-y-3">
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
              className={`rounded-full px-3 py-1 text-xs font-semibold border ${
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

      <p className="text-sm text-slate-700">
        {nextMilestone != null && amountToNextMilestone != null ? (
          <>
            Next milestone: <strong className="text-slate-900">{formatCad(nextMilestone)}</strong>
            {' — '}
            {formatCad(amountToNextMilestone)} to go
          </>
        ) : (
          <>
            <strong className="text-slate-900">Let&apos;s keep going</strong> — every dollar still counts.
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

  const btnClass = `inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors ${focusRing}`

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
  const [campaign, setCampaign] = useState<WildfireCampaignConfig>(WILDFIRE_CAMPAIGN)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadWildfireCampaign().then((data) => {
      if (!cancelled) {
        setCampaign(data)
        setLoaded(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const derived = deriveWildfireCampaign(campaign)
  const matchMax = formatCad(campaign.matchMaximum)
  const matchActiveLabel = campaign.matchCompleted
    ? 'Match completed'
    : derived.matchUnlocked
      ? 'Match unlocked'
      : 'Match active'

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 ${loaded ? '' : ''}`}>
      <TopNavigation />

      {/* HERO — full-bleed image + high-contrast copy */}
      <header className="relative overflow-hidden text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={campaign.heroImageUrl}
          alt="Wildfire smoke rising over a lake near Namaygoosisagagun First Nation"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-black/65"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40" aria-hidden />

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 md:px-8 py-14 sm:py-20">
          <p className="text-xs uppercase tracking-[0.28em] text-white/80 font-semibold mb-3 drop-shadow">
            Community fundraiser · {matchActiveLabel}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold tracking-tight leading-[1.15] text-white drop-shadow-md">
            An entire community was displaced by wildfire.
            <span className="block mt-2 text-white drop-shadow-md">Help them recover.</span>
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-white font-medium leading-relaxed max-w-2xl drop-shadow">
            Namaygoosisagagun First Nation lost homes and community when wildfire forced everyone out.
            Donate through the official fundraiser — ProtectOnt will match the first {matchMax}.
          </p>

          <div className="mt-6 inline-flex flex-wrap items-center gap-2 rounded-2xl border border-white/30 bg-[#152a45]/70 backdrop-blur-sm px-4 py-3 shadow-lg">
            <span className="text-white font-bold text-sm uppercase tracking-wide">
              ProtectOnt match
            </span>
            <span className="text-white/95 font-semibold text-sm sm:text-base">
              Your gift doubles until we hit {matchMax}
            </span>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <DonateButton href={campaign.officialDonationUrl} />
            <a
              href="#donation-confirmation"
              className={`text-sm font-medium text-white underline underline-offset-4 decoration-white/50 hover:decoration-white ${focusRing} rounded-sm`}
            >
              Already donated? Add it to our total →
            </a>
          </div>
          <p className="mt-4 text-sm text-white/90 max-w-xl">
            Donate online at{' '}
            <a
              href={campaign.officialDonationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-semibold text-white underline underline-offset-2 ${focusRing} rounded-sm`}
            >
              an7gc.ca/donate
            </a>
            {' '}or e-transfer{' '}
            <a
              href={`mailto:${campaign.etransferEmail}`}
              className={`font-semibold text-white underline underline-offset-2 ${focusRing} rounded-sm`}
            >
              {campaign.etransferEmail}
            </a>
            . ProtectOnt never handles the money.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 md:px-8 py-10 sm:py-14 space-y-10 sm:space-y-12">
        {/* MATCH — high on the page */}
        <section id="match" className={sectionClass} aria-labelledby="match-heading">
          <div className="rounded-2xl border-2 border-[#3d2b7a]/25 bg-gradient-to-br from-violet-50 via-white to-white p-6 sm:p-8 shadow-md">
            <p className="text-xs uppercase tracking-[0.25em] text-[#3d2b7a] font-bold mb-2">
              Limited match
            </p>
            <h2 id="match-heading" className="text-2xl sm:text-3xl font-bold tracking-tight text-[#152a45]">
              ProtectOnt matches the first {matchMax}
            </h2>
            <p className={`mt-3 text-sm sm:text-base ${bodyClass}`}>
              Give online at{' '}
              <a
                href={campaign.officialDonationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#152a45] underline underline-offset-2"
              >
                an7gc.ca/donate
              </a>
              {' '}or by e-transfer to{' '}
              <a
                href={`mailto:${campaign.etransferEmail}`}
                className="font-semibold text-[#152a45] underline underline-offset-2"
              >
                {campaign.etransferEmail}
              </a>
              .
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-[#152a45] text-white px-4 py-4">
                <p className="text-xs uppercase tracking-wider text-white/70">Matched so far</p>
                <p className="mt-1 text-2xl font-bold">
                  {formatCad(derived.personalMatch)}
                  <span className="text-base font-medium text-white/70"> / {matchMax}</span>
                </p>
              </div>
              <div className="rounded-xl bg-white border border-slate-200 px-4 py-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">Match status</p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {campaign.matchCompleted
                    ? 'Matching donation completed ✓'
                    : derived.matchUnlocked
                      ? 'Match unlocked — pending transfer'
                      : 'Active — your gift can still double'}
                </p>
              </div>
            </div>

            <div
              className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(derived.matchedProgress)}
              aria-label={`Matching progress ${Math.round(derived.matchedProgress)} percent`}
            >
              <div
                className="h-full rounded-full bg-[#152a45] transition-[width] duration-700 ease-out motion-reduce:transition-none"
                style={{ width: `${derived.matchedProgress}%` }}
              />
            </div>

            {derived.matchUnlocked ? (
              <p className="mt-4 text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                Match unlocked. The first {matchMax} was doubled — keep giving to raise the community total further.
              </p>
            ) : (
              <p className="mt-4 text-sm font-medium text-[#152a45]">
                {formatCad(campaign.matchMaximum - derived.personalMatch)} left in the matching window.
              </p>
            )}

            {campaign.matchConfirmationUrl.trim() ? (
              <a
                href={campaign.matchConfirmationUrl.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-3 inline-flex text-[#3d2b7a] font-semibold underline underline-offset-2 ${focusRing} rounded-sm`}
              >
                View matching donation confirmation
              </a>
            ) : null}

            <div className="mt-6">
              <DonateButton href={campaign.officialDonationUrl} className="w-full sm:w-auto" />
            </div>
          </div>
        </section>

        {/* COMMUNITY TOTAL */}
        <section id="progress" className={sectionClass} aria-labelledby="progress-heading">
          <h2 id="progress-heading" className={h2Class}>
            How much can we raise together?
          </h2>
          <p className={`mt-2 ${bodyClass}`}>
            Every confirmed ProtectOnt community donation shows up here.
          </p>

          <div className={`${cardClass} mt-6 border-[#2E4A6B]/20`}>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-semibold">Community total</p>
            <p className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight text-[#152a45]">
              {formatCad(campaign.communityTotal)}
            </p>
            <p className="mt-1 text-slate-600">
              raised by our community ·{' '}
              <strong className="text-slate-900">{campaign.donorCount}</strong>{' '}
              {campaign.donorCount === 1 ? 'donor' : 'donors'}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3 text-center sm:text-left">
              <div className="rounded-xl bg-slate-50 px-3 py-3">
                <p className="text-xs uppercase tracking-wider text-slate-500">Community</p>
                <p className="text-xl font-bold text-[#152a45]">{formatCad(campaign.communityTotal)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-3">
                <p className="text-xs uppercase tracking-wider text-slate-500">ProtectOnt match</p>
                <p className="text-xl font-bold text-slate-800">{formatCad(derived.personalMatch)}</p>
              </div>
              <div className="rounded-xl bg-[#152a45] text-white px-3 py-3">
                <p className="text-xs uppercase tracking-wider text-white/70">Combined impact</p>
                <p className="text-xl font-bold">{formatCad(derived.combinedImpact)}</p>
              </div>
            </div>

            <MilestoneTracker
              communityTotal={campaign.communityTotal}
              milestones={campaign.milestones}
              nextMilestone={derived.nextMilestone}
              amountToNextMilestone={derived.amountToNextMilestone}
            />
          </div>
        </section>

        {/* WHY — short + CBC */}
        <section id="why" className={sectionClass} aria-labelledby="why-heading">
          <h2 id="why-heading" className={h2Class}>
            Why this matters
          </h2>
          <p className={`mt-3 text-lg ${bodyClass}`}>
            Wildfire forced the entire community from their homes. The official fundraiser is covering emergency
            needs and recovery — supplies, shelter, and getting people back on their feet.
          </p>
          <ul className="mt-4 space-y-2">
            {campaign.pressLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-[#3d2b7a] font-semibold underline underline-offset-2 hover:text-[#2a1f58] ${focusRing} rounded-sm`}
                >
                  {link.label} ↗
                </a>
              </li>
            ))}
          </ul>
          <p className={`mt-4 ${bodyClass}`}>
            Full details on how funds are used:{' '}
            <a
              href={campaign.officialDonationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-[#3d2b7a] font-semibold underline underline-offset-2 ${focusRing} rounded-sm`}
            >
              an7gc.ca/donate
            </a>
          </p>
        </section>

        {/* CONFIRMATION */}
        <section id="donation-confirmation" className={sectionClass} aria-labelledby="confirm-heading">
          <div className={cardClass}>
            <h2 id="confirm-heading" className={h2Class}>
              Already donated?
            </h2>
            <p className={`mt-3 ${bodyClass}`}>
              Tell us the amount so we can add it to the ProtectOnt community total. Strip out addresses, receipt
              numbers, and payment details — we only need the amount, confirmation it went to the official fundraiser,
              and whether to list your name or Anonymous.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              {campaign.contactEmail.trim() ? (
                <a
                  href={confirmationMailto(campaign)}
                  className={`inline-flex items-center justify-center rounded-xl bg-[#152a45] px-5 py-3 text-sm font-bold text-white hover:bg-[#1e3a5f] transition-colors ${focusRing}`}
                >
                  Send your donation confirmation
                </a>
              ) : null}
              {campaign.confirmationFormUrl.trim() ? (
                <a
                  href={campaign.confirmationFormUrl.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors ${focusRing}`}
                >
                  Submit through the confirmation form
                </a>
              ) : null}
            </div>
          </div>
        </section>

        {/* DONORS */}
        {campaign.showDonorList ? (
          <section id="donors" className={sectionClass} aria-labelledby="donors-heading">
            <h2 id="donors-heading" className={h2Class}>
              From our community
            </h2>
            {campaign.donations.length === 0 ? (
              <p className={`mt-3 ${bodyClass}`}>
                No confirmations yet — be the first.{' '}
                <a
                  href="#donation-confirmation"
                  className={`text-[#3d2b7a] font-semibold underline underline-offset-2 ${focusRing} rounded-sm`}
                >
                  Add yours
                </a>
                .
              </p>
            ) : (
              <ul className="mt-5 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                {campaign.donations.map((d, idx) => (
                  <li
                    key={`${d.displayName}-${d.date}-${idx}`}
                    className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-4"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{d.displayName}</p>
                      <p className="text-sm text-slate-500">{formatDonationDate(d.date)}</p>
                    </div>
                    <p className="text-lg font-bold text-[#152a45]">{formatCad(d.amount)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

        {/* SHARE */}
        <section id="share" className={sectionClass} aria-labelledby="share-heading">
          <h2 id="share-heading" className={h2Class}>
            Can&apos;t give today? Share it.
          </h2>
          <p className={`mt-2 ${bodyClass}`}>
            One share can reach someone who can donate — and unlock more of the ProtectOnt match.
          </p>
          <div className="mt-5">
            <ShareActions campaign={campaign} />
          </div>
        </section>

        {/* HOW IT WORKS — tight */}
        <section id="how-it-works" className={sectionClass} aria-labelledby="how-heading">
          <h2 id="how-heading" className={h2Class}>
            How this works
          </h2>
          <ol className="mt-5 space-y-4">
            {[
              {
                title: 'Donate on the official site',
                body: 'All money goes through Anishinabek Nation 7th Generation Charity. ProtectOnt never collects funds.',
              },
              {
                title: 'Report your gift',
                body: 'Email us the amount so we can grow the community total and apply the match.',
              },
              {
                title: 'Watch the total climb',
                body: 'We update this page with community donations, match progress, and combined impact.',
              },
            ].map((item, i) => (
              <li key={item.title} className="flex gap-4">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#152a45] text-sm font-bold text-white"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className={`mt-0.5 text-sm ${bodyClass}`}>{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* RECEIPTS + DISCLAIMER — compact */}
        <section
          className="rounded-2xl border border-slate-200 bg-white px-5 py-6 sm:px-6 space-y-4 text-sm text-slate-600 leading-relaxed"
          aria-label="Receipts and disclaimer"
        >
          <div>
            <h2 className="text-base font-bold text-slate-900">Donation receipts</h2>
            <p className="mt-1">
              Receipts come from the official charity or its donation provider. ProtectOnt does not issue tax receipts
              or give tax advice.
            </p>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Independent community effort</h2>
            <p className="mt-1">
              This page is hosted by Protect Ontario. It is not an official page of Namaygoosisagagun First Nation, the
              Anishinabek Nation, or Anishinabek Nation 7th Generation Charity. Donations are completed on their site.
            </p>
          </div>
        </section>

        {/* FINAL CTA */}
        <div className="rounded-2xl overflow-hidden relative text-center text-white px-6 py-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={campaign.heroImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden
          />
          <div className="absolute inset-0 bg-black/75" aria-hidden />
          <div className="relative">
            <p className="text-white/80 text-xs uppercase tracking-[0.25em] font-bold">Double your impact</p>
            <p className="mt-2 text-2xl sm:text-3xl font-bold">
              Donate now — ProtectOnt matches the first {matchMax}
            </p>
            <DonateButton href={campaign.officialDonationUrl} className="mt-6" />
          </div>
        </div>
      </main>
    </div>
  )
}
