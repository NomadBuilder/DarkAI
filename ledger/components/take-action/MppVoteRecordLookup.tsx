'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  formatPostalCodeDisplay,
  normalizePostalCode,
} from '@/lib/postal-code'
import {
  FEATURED_BILL_ORDER,
  formatVoteShareText,
  loadFeaturedVotesDataset,
  lookupFeaturedMppByPostal,
  mailtoForMppRecord,
  oneLineAskForVotes,
  voteTone,
  type FeaturedBillMeta,
  type FeaturedMpp,
} from '@/lib/mpp-featured-votes'

type Props = {
  /** Compact layout for homepage CTA strip */
  compact?: boolean
  /** Override share / deep-link URL */
  sharePath?: string
}

type ResultState = {
  mpp: FeaturedMpp
  bills: FeaturedBillMeta[]
  postal: string
  city: string | null
  warning: string | null
  ask: string
}

function voteBadgeClass(vote: string): string {
  const tone = voteTone(vote)
  if (tone === 'yes') return 'bg-red-100 text-red-900 border-red-200'
  if (tone === 'no') return 'bg-emerald-100 text-emerald-900 border-emerald-200'
  if (tone === 'noshow') return 'bg-amber-100 text-amber-950 border-amber-200'
  return 'bg-slate-100 text-slate-700 border-slate-200'
}

export default function MppVoteRecordLookup({
  compact = false,
  sharePath = '/take-action#your-mpp-record',
}: Props) {
  const [postal, setPostal] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ResultState | null>(null)
  const [copied, setCopied] = useState(false)
  const [canNativeShare, setCanNativeShare] = useState(false)

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setCopied(false)

    const parsed = normalizePostalCode(postal)
    if (parsed.kind !== 'ca') {
      setError('Enter a valid Ontario postal code (e.g. M5V 2T6).')
      return
    }

    setPostal(formatPostalCodeDisplay(parsed))
    setLoading(true)

    try {
      const dataset = await loadFeaturedVotesDataset()
      const lookup = await lookupFeaturedMppByPostal(parsed.value, dataset.mpps)
      if (!lookup.ok) {
        setError(lookup.error)
        return
      }

      const bills =
        dataset.bills.length > 0
          ? dataset.bills
          : FEATURED_BILL_ORDER.map((id) => ({ id, short: id, title: id }))

      setResult({
        mpp: lookup.mpp,
        bills,
        postal: lookup.postal,
        city: lookup.city,
        warning: lookup.warning,
        ask: oneLineAskForVotes(lookup.mpp.votes),
      })
    } catch {
      setError('Lookup failed. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${sharePath}`
      : `https://protectont.ca${sharePath}`

  const handleCopyShare = async () => {
    if (!result) return
    const text = formatVoteShareText({
      mpp: result.mpp,
      bills: result.bills,
      postal: result.postal,
      ask: result.ask,
      pageUrl: shareUrl,
    })
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy — select the text and copy manually.')
    }
  }

  const handleNativeShare = async () => {
    if (!result || !navigator.share) return
    const text = formatVoteShareText({
      mpp: result.mpp,
      bills: result.bills,
      postal: result.postal,
      ask: result.ask,
      pageUrl: shareUrl,
    })
    try {
      await navigator.share({
        title: `${result.mpp.name} — six-bill record`,
        text,
        url: shareUrl,
      })
    } catch {
      /* user cancelled */
    }
  }

  return (
    <section
      id="your-mpp-record"
      className={
        compact
          ? 'scroll-mt-28 sm:scroll-mt-32 px-4 sm:px-6 md:px-8 py-12 md:py-14 bg-gradient-to-br from-[#2a1f4a] via-slate-900 to-slate-900 border-y border-white/10'
          : 'scroll-mt-28 sm:scroll-mt-32 px-4 sm:px-6 md:px-8 py-12 md:py-16 bg-gradient-to-br from-violet-50 via-white to-amber-50/40 border-y border-slate-100'
      }
    >
      <div className={`mx-auto ${compact ? 'max-w-3xl' : 'max-w-4xl'}`}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <p
            className={`text-xs uppercase tracking-[0.2em] font-medium mb-3 text-center ${
              compact ? 'text-[#f9e04c]/40' : 'text-violet-700/70'
            }`}
          >
            Six bills · one riding
          </p>
          <h2
            className={`font-light text-center mb-3 ${
              compact
                ? 'text-2xl sm:text-3xl text-white'
                : 'text-2xl sm:text-3xl md:text-4xl text-gray-900'
            }`}
          >
            Your MPP&apos;s record on these six
          </h2>
          <p
            className={`font-light text-center mb-8 leading-relaxed mx-auto ${
              compact
                ? 'text-white/75 text-base max-w-xl'
                : 'text-gray-600 text-lg max-w-2xl'
            }`}
          >
            Enter your postal code. See Yes / No / No Show on Bills 5, 17, 24, 60, 68 &amp; 97 — then
            a one-line ask you can send.
          </p>

          <form
            onSubmit={handleSubmit}
            className={
              compact
                ? 'rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm p-5 sm:p-6'
                : 'rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-md shadow-slate-900/5'
            }
          >
            <label
              htmlFor={compact ? 'mpp-vote-postal-home' : 'mpp-vote-postal'}
              className={`block text-sm font-light mb-2 ${
                compact ? 'text-white/70' : 'text-slate-600'
              }`}
            >
              Ontario postal code
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id={compact ? 'mpp-vote-postal-home' : 'mpp-vote-postal'}
                type="text"
                inputMode="text"
                autoComplete="postal-code"
                placeholder="e.g. M5V 2T6"
                value={postal}
                onChange={(e) => setPostal(e.target.value)}
                onBlur={() => {
                  const p = normalizePostalCode(postal)
                  if (p.kind === 'ca') setPostal(formatPostalCodeDisplay(p))
                }}
                className={
                  compact
                    ? 'flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#f9e04c]/50'
                    : 'flex-1 rounded-lg border border-slate-200 px-4 py-3 text-gray-900 font-light placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-200'
                }
              />
              <button
                type="submit"
                disabled={loading}
                className={
                  compact
                    ? 'shrink-0 rounded-lg bg-[#f9e04c] px-6 py-3 text-slate-900 text-sm font-medium hover:bg-[#f5d93a] transition-colors disabled:opacity-60'
                    : 'shrink-0 rounded-lg bg-slate-900 px-6 py-3 text-white text-sm font-light hover:bg-slate-800 transition-colors disabled:opacity-60'
                }
              >
                {loading ? 'Looking up…' : 'See their record'}
              </button>
            </div>
            {error && (
              <p
                className={`mt-3 text-sm font-light ${compact ? 'text-red-300' : 'text-red-700'}`}
                role="alert"
              >
                {error}
              </p>
            )}
          </form>

          {result && (
            <div
              className={
                compact
                  ? 'mt-6 rounded-2xl border border-white/15 bg-white p-5 sm:p-6 text-left'
                  : 'mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm text-left'
              }
              role="status"
              aria-live="polite"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-xl sm:text-2xl font-light text-gray-900">{result.mpp.name}</h3>
                  <p className="text-sm text-slate-600 font-light mt-1">
                    {result.mpp.party} · {result.mpp.riding}
                    {result.city ? ` · ${result.city}` : ''}
                    {' · '}
                    {result.postal}
                  </p>
                </div>
                {result.mpp.profileUrl ? (
                  <a
                    href={result.mpp.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-violet-700 hover:text-violet-900 underline underline-offset-2 shrink-0"
                  >
                    OLA profile ↗
                  </a>
                ) : null}
              </div>

              {result.warning && (
                <p className="mb-4 text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 font-light">
                  {result.warning}
                </p>
              )}

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
                {result.bills.map((bill) => {
                  const vote = result.mpp.votes[bill.id] || '—'
                  return (
                    <li
                      key={bill.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{bill.id}</p>
                        <p className="text-xs text-slate-500 font-light truncate">{bill.short}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium ${voteBadgeClass(vote)}`}
                      >
                        {vote}
                      </span>
                    </li>
                  )
                })}
              </ul>

              <div className="rounded-xl border border-violet-100 bg-violet-50/70 px-4 py-3.5 mb-5">
                <p className="text-xs uppercase tracking-wider text-violet-700/70 mb-1.5">
                  One-line ask
                </p>
                <p className="text-gray-900 font-light leading-relaxed">{result.ask}</p>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                <a
                  href={mailtoForMppRecord({
                    mpp: result.mpp,
                    bills: result.bills,
                    ask: result.ask,
                  })}
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-light text-white hover:bg-slate-800 transition-colors"
                >
                  Email this MPP
                </a>
                <button
                  type="button"
                  onClick={handleCopyShare}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-light text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy share text'}
                </button>
                {canNativeShare ? (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-light text-slate-800 hover:bg-slate-50 transition-colors"
                  >
                    Share
                  </button>
                ) : null}
                <Link
                  href="/reports/they-called-it-protection"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-light text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  Full accountability brief
                </Link>
              </div>
            </div>
          )}

          {!compact && (
            <p className="mt-5 text-center text-xs text-slate-500 font-light">
              Riding match via OpenNorth Represent · vote data from the ProtectOnt / ONAC MPP tracker
            </p>
          )}
        </motion.div>
      </div>
    </section>
  )
}
