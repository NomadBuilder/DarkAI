'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Protest } from '@/lib/protests'
import { mapsUrlForEvent } from '@/lib/protests'
import {
  formatDistanceKm,
  geocodePostalCode,
  rankProtestsByDistance,
  type ProtestWithDistance,
} from '@/lib/protest-nearby'
import {
  formatPostalCodeDisplay,
  isValidPostalCode,
  normalizePostalCode,
} from '@/lib/postal-code'

type Props = {
  protests: Protest[]
  /** Prefer May 30 campaign when finding nearest */
  campaignId?: string
}

export default function FindNearestProtest({ protests, campaignId = 'may-30-2026' }: Props) {
  const [postal, setPostal] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<ProtestWithDistance[] | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResults(null)

    const parsed = normalizePostalCode(postal)
    if (!isValidPostalCode(parsed)) {
      setError(
        'Enter a valid Canadian postal code (e.g. M5H 2N2, with or without a space) or US ZIP code.'
      )
      return
    }

    setPostal(formatPostalCodeDisplay(parsed))

    setLoading(true)
    try {
      const coords = await geocodePostalCode(parsed.value)
      if (!coords) {
        setError('We couldn’t find that postal code. Double-check and try again.')
        return
      }

      const ranked = rankProtestsByDistance(coords, protests, {
        campaignId,
        limit: 3,
      })

      if (ranked.length === 0) {
        setError('No upcoming protest locations matched. Try browsing the full list below.')
        return
      }

      setResults(ranked)
      const top = ranked[0]
      requestAnimationFrame(() => {
        const el = document.getElementById(`event-${top.protest.id}`)
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    } catch {
      setError('Lookup failed. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      id="find-nearest"
      className="px-4 sm:px-6 md:px-8 py-14 md:py-16 bg-gradient-to-br from-blue-50/90 via-white to-white border-b border-slate-100 scroll-mt-28 sm:scroll-mt-32"
    >
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-blue-800/70 mb-3 font-medium text-center">
            May 30, 2026
          </p>
          <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-3 text-center">
            Find your nearest protest
          </h2>
          <p className="text-gray-600 font-light text-center mb-8 leading-relaxed max-w-xl mx-auto">
            Enter your postal code (or ZIP if you&apos;re near the border). We&apos;ll show the closest Fight Ford
            rallies on May 30 and scroll you to the details.
          </p>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-md shadow-slate-900/5"
          >
            <label htmlFor="postal-lookup" className="block text-sm text-slate-600 font-light mb-2">
              Postal code or ZIP
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="postal-lookup"
                type="text"
                inputMode="text"
                autoComplete="postal-code"
                placeholder="e.g. L4M 1A1 or M5H 2N2"
                value={postal}
                onChange={(e) => setPostal(e.target.value)}
                onBlur={() => {
                  const p = normalizePostalCode(postal)
                  if (p.kind !== 'unknown') setPostal(formatPostalCodeDisplay(p))
                }}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-3 text-gray-900 font-light placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button
                type="submit"
                disabled={loading}
                className="shrink-0 rounded-lg bg-slate-900 px-6 py-3 text-white text-sm font-light hover:bg-slate-800 transition-colors disabled:opacity-60"
              >
                {loading ? 'Finding…' : 'Find nearest'}
              </button>
            </div>
            {error && (
              <p className="mt-3 text-sm text-red-700 font-light" role="alert">
                {error}
              </p>
            )}
          </form>

          {results && results.length > 0 && (
            <div className="mt-8 space-y-4" role="status" aria-live="polite">
              <p className="text-sm text-slate-500 font-light text-center">
                Closest listings for May 30 (straight-line distance between city centres—confirm the exact spot on
                the map):
              </p>
              {results.map(({ protest, distanceKm, city }, idx) => {
                const mapsUrl = mapsUrlForEvent(protest)
                return (
                  <div
                    key={protest.id}
                    className={`rounded-xl border p-5 sm:p-6 ${
                      idx === 0
                        ? 'border-blue-300 bg-blue-50/60 ring-1 ring-blue-100'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    {idx === 0 && (
                      <span className="inline-block text-xs uppercase tracking-wider text-blue-800 font-medium mb-2">
                        Nearest to you
                      </span>
                    )}
                    <h3 className="text-lg font-light text-gray-900">{city}</h3>
                    <p className="text-sm text-slate-500 font-light mt-1">
                      {protest.date} · {formatDistanceKm(distanceKm)}
                    </p>
                    {protest.description && (
                      <p className="text-sm text-gray-600 font-light mt-3 leading-relaxed">{protest.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          document.getElementById(`event-${protest.id}`)?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                          })
                        }}
                        className="text-sm text-blue-600 font-light hover:text-blue-700 underline underline-offset-2"
                      >
                        View full listing ↓
                      </button>
                      {mapsUrl && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 font-light hover:text-blue-700 underline underline-offset-2"
                        >
                          Directions →
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <p className="mt-6 text-center text-sm text-slate-500 font-light">
            New to protesting? Read our{' '}
            <a href="#protest-faq" className="text-blue-600 underline underline-offset-2 hover:text-blue-700">
              Protest FAQ
            </a>
            .{' '}
            <Link href="/join" className="text-blue-600 underline underline-offset-2 hover:text-blue-700">
              Order a sign
            </Link>{' '}
            before you go.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
