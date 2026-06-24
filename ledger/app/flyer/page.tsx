'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import TopNavigation from '@/components/TopNavigation'
import FlyerCard from '@/components/flyers/FlyerCard'
import { getPublicDataFile } from '@/utils/dataPath'
import { getPublishedFlyers, parseFlyersFile } from '@/lib/flyers'

export default function FlyerIndexPage() {
  const [flyers, setFlyers] = useState<ReturnType<typeof getPublishedFlyers>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch(getPublicDataFile('flyers.json'), { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (cancelled) return
        setFlyers(getPublishedFlyers(parseFlyersFile(data)))
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopNavigation />

      <header className="border-b border-slate-200 bg-gradient-to-br from-slate-950 via-[#152a45] to-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 sm:pt-28 sm:pb-12">
          <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-blue-200/90 mb-3 font-medium">
            Community materials
          </p>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight leading-tight mb-4">
            Printable awareness flyers
          </h1>
          <p className="text-lg text-slate-200/95 font-light max-w-2xl leading-relaxed">
            Full letter-size (8.5″×11″) posters for community boards, doors, and events. Each issue flyer includes
            detailed bullets and sources — open one, then print or save as PDF.
          </p>
          <p className="mt-4 text-sm text-slate-300/90 font-light">
            Need yard signs or apparel?{' '}
            <Link href="/products" className="text-white underline-offset-4 hover:underline">
              Browse products
            </Link>
            {' '}or{' '}
            <Link href="/materials" className="text-white underline-offset-4 hover:underline">
              DIY materials
            </Link>
            .
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-10">
        {loading ? (
          <p className="text-slate-600 font-light">Loading flyers…</p>
        ) : flyers.length === 0 ? (
          <p className="text-slate-600 font-light">No flyers published yet. Check back soon.</p>
        ) : (
          <section>
            <h2 className="text-2xl sm:text-3xl font-light text-slate-900 mb-2">Issue flyers</h2>
            <p className="text-sm text-slate-600 font-light leading-relaxed max-w-2xl mb-5">
              Choose a topic, preview the full poster, then use your browser&apos;s print dialog to save as PDF or send
              to a printer.
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              {flyers.map((flyer, i) => (
                <FlyerCard key={flyer.id} flyer={flyer} index={i} />
              ))}
            </div>
          </section>
        )}

        <section className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
          <h2 className="text-lg font-medium text-slate-900 mb-3">How to print</h2>
          <ul className="space-y-3 text-sm text-slate-600 font-light leading-relaxed list-disc pl-5">
            <li>Open a flyer and click <strong className="font-medium text-slate-800">Print / Save as PDF</strong>.</li>
            <li>Use letter size (8.5″×11″) and enable background graphics for best results.</li>
            <li>Post on community boards, share at events, or leave with neighbours — sources are included on each flyer.</li>
          </ul>
        </section>
      </main>
    </div>
  )
}
