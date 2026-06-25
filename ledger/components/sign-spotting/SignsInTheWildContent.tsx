'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  fetchSignSpots,
  postalToFsa,
  submitSignSpot,
  type SignSpotItem,
} from '@/lib/sign-spotting'
import {
  formatPostalCodeDisplay,
  isValidPostalCode,
  normalizePostalCode,
} from '@/lib/postal-code'

export default function SignsInTheWildContent() {
  const [spots, setSpots] = useState<SignSpotItem[]>([])
  const [countThisWeek, setCountThisWeek] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [postal, setPostal] = useState('')
  const [caption, setCaption] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const loadGallery = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const data = await fetchSignSpots()
      setSpots(data.spots)
      setCountThisWeek(data.countThisWeek)
    } catch {
      setLoadError('Gallery could not be loaded right now. You can still upload a photo.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadGallery()
  }, [loadGallery])

  useEffect(() => {
    if (!photo) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(photo)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitSuccess('')

    if (!photo) {
      setSubmitError('Please choose a photo of your yard sign or rally sign.')
      return
    }

    const fd = new FormData()
    fd.append('photo', photo)
    if (caption.trim()) fd.append('caption', caption.trim())

    const parsed = normalizePostalCode(postal)
    if (postal.trim()) {
      if (!isValidPostalCode(parsed) || parsed.kind !== 'ca') {
        setSubmitError('Enter a valid Canadian postal code (e.g. M5H 2N2) — we only store the first three characters.')
        return
      }
      fd.append('postalCode', parsed.value)
      const fsa = postalToFsa(parsed.value)
      if (fsa) fd.append('fsa', fsa)
    }

    setSubmitting(true)
    try {
      const { message } = await submitSignSpot(fd)
      setSubmitSuccess(message)
      setPhoto(null)
      setCaption('')
      setPostal('')
      if (fileRef.current) fileRef.current.value = ''
      await loadGallery()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <section className="px-4 sm:px-6 md:px-8 py-12 md:py-16 bg-gradient-to-br from-slate-950 via-[#152a45] to-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-blue-200/90 mb-3 font-medium">Visible support</p>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight mb-4">Signs in the wild</h1>
          <p className="text-lg text-slate-200/95 font-light max-w-2xl mx-auto leading-relaxed">
            Upload a photo of a ProtectOnt, Fight Ford, or accountability yard sign. We show{' '}
            <strong className="font-normal text-white">FSA only</strong> (e.g. &quot;Near M5H&quot;) — never your full
            postal code or street address.
          </p>
          {!loading && (
            <p className="mt-6 text-3xl sm:text-4xl font-light text-white">
              {countThisWeek}{' '}
              <span className="text-lg text-slate-300">sign{countThisWeek === 1 ? '' : 's'} spotted this week</span>
            </p>
          )}
        </div>
      </section>

      <section id="upload" className="px-4 sm:px-6 md:px-8 py-12 md:py-16 bg-white border-b border-slate-100 scroll-mt-28">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-light text-slate-900 mb-2">Share your sign</h2>
          <p className="text-sm text-slate-600 font-light mb-6 leading-relaxed">
            Optional postal code helps neighbours see signs near them. Photos may be reviewed before appearing in the
            gallery.
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="sign-photo" className="block text-sm font-light text-slate-700 mb-2">
                Photo *
              </label>
              <input
                ref={fileRef}
                id="sign-photo"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/heic"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-800"
              />
              {preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Preview" className="mt-3 max-h-48 rounded-lg border border-slate-200 object-contain" />
              )}
            </div>
            <div>
              <label htmlFor="sign-postal" className="block text-sm font-light text-slate-700 mb-2">
                Postal code <span className="text-slate-400">(optional — FSA only published)</span>
              </label>
              <input
                id="sign-postal"
                type="text"
                inputMode="text"
                autoComplete="postal-code"
                placeholder="e.g. M5H 2N2"
                value={postal}
                onChange={(e) => setPostal(e.target.value)}
                onBlur={() => {
                  const p = normalizePostalCode(postal)
                  if (p.kind === 'ca') setPostal(formatPostalCodeDisplay(p))
                }}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 font-light focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label htmlFor="sign-caption" className="block text-sm font-light text-slate-700 mb-2">
                Caption <span className="text-slate-400">(optional)</span>
              </label>
              <input
                id="sign-caption"
                type="text"
                maxLength={120}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Lawn on Main St — first sign on the block"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 font-light focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
            {submitError && (
              <p className="text-sm text-red-700 font-light" role="alert">
                {submitError}
              </p>
            )}
            {submitSuccess && (
              <p className="text-sm text-green-800 font-light" role="status">
                {submitSuccess}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white font-light rounded-lg hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting ? 'Uploading…' : 'Upload sign photo'}
            </button>
          </form>
        </div>
      </section>

      <section className="px-4 sm:px-6 md:px-8 py-12 md:py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-light text-slate-900 mb-6 text-center">Gallery</h2>
          {loading && <p className="text-center text-slate-500 font-light">Loading gallery…</p>}
          {loadError && <p className="text-center text-amber-800 font-light text-sm mb-6">{loadError}</p>}
          {!loading && spots.length === 0 && !loadError && (
            <p className="text-center text-slate-500 font-light">No signs yet — yours could be the first.</p>
          )}
          {spots.length > 0 && (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {spots.map((spot, idx) => (
                <motion.li
                  key={spot.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"
                >
                  {spot.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={spot.photoUrl}
                      alt={spot.caption || `Sign spotted ${spot.locationLabel}`}
                      className="w-full aspect-[4/3] object-cover bg-slate-100"
                    />
                  ) : (
                    <div className="w-full aspect-[4/3] bg-slate-100" />
                  )}
                  <div className="p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-500 font-medium">{spot.locationLabel}</p>
                    {spot.caption && (
                      <p className="mt-1 text-sm text-slate-600 font-light leading-relaxed">{spot.caption}</p>
                    )}
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
          <p className="mt-10 text-center text-sm text-slate-500 font-light">
            Need a sign?{' '}
            <Link href="/join#download-a-sign" className="text-blue-600 underline underline-offset-2">
              Download or order one
            </Link>
            {' · '}
            <Link href="/take-action" className="text-blue-600 underline underline-offset-2">
              More ways to take action
            </Link>
          </p>
        </div>
      </section>
    </>
  )
}
