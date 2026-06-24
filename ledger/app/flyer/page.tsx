'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import TopNavigation from '@/components/TopNavigation'
import FlyerCard, { FlyerCardSkeleton } from '@/components/flyers/FlyerCard'
import FlyerCredibilityCallout from '@/components/flyers/FlyerCredibilityCallout'
import FlyerPrintPack from '@/components/flyers/FlyerPrintPack'
import { getPublicDataFile } from '@/utils/dataPath'
import { getPublishedFlyers, parseFlyersFile, type Flyer } from '@/lib/flyers'

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5 },
}

function partitionFlyers(flyers: Flyer[]) {
  const overview = flyers.find((f) => f.slug === 'overview')
  const rest = flyers.filter((f) => f.slug !== 'overview')
  return { overview, rest }
}

export default function FlyerIndexPage() {
  const [flyers, setFlyers] = useState<Flyer[]>([])
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

  const { overview, rest } = useMemo(() => partitionFlyers(flyers), [flyers])

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
            Letter-size posters with sourced facts on Ford government cuts, privatization, and accountability — free to
            print and share.
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-12">
        {!( !loading && flyers.length === 0 ) && (
          <motion.section {...fade}>
            <FlyerPrintPack />
          </motion.section>
        )}

        <motion.section {...fade}>
          <FlyerCredibilityCallout />
        </motion.section>

        {loading ? (
          <section className="space-y-8" aria-busy="true" aria-label="Loading flyers">
            <FlyerCardSkeleton featured />
            <div className="grid gap-4 sm:grid-cols-2">
              <FlyerCardSkeleton />
              <FlyerCardSkeleton />
              <FlyerCardSkeleton />
              <FlyerCardSkeleton />
            </div>
          </section>
        ) : flyers.length === 0 ? (
          <p className="text-slate-600 font-light">No flyers published yet. Check back soon.</p>
        ) : (
          <>
            {overview && (
              <motion.section {...fade}>
                <FlyerCard flyer={overview} featured index={0} />
              </motion.section>
            )}

            {rest.length > 0 && (
              <motion.section {...fade}>
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-5">
                  <div>
                    <h2 className="text-2xl font-light text-slate-900">Issue flyers</h2>
                    <p className="text-sm text-slate-600 font-light mt-1">
                      {rest.length} topic{rest.length === 1 ? '' : 's'} — each with bullets and sources for printing.
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {rest.map((flyer, i) => (
                    <FlyerCard key={flyer.id} flyer={flyer} index={i} />
                  ))}
                </div>
              </motion.section>
            )}
          </>
        )}

        <motion.section
          {...fade}
          className="rounded-2xl border border-[#2E4A6B]/25 bg-gradient-to-br from-slate-950 via-[#152a45] to-[#2E4A6B] p-8 sm:p-10 text-white shadow-lg"
        >
          <h2 className="text-2xl sm:text-3xl font-light leading-tight mb-3">Ready to take action?</h2>
          <p className="text-base sm:text-lg text-slate-200/95 font-light leading-relaxed max-w-2xl mb-8">
            Download flyers, learn how to talk to neighbours, and find a local protest.
          </p>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <Link
              href="/message-guide"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm sm:text-base font-medium text-white hover:bg-white/15 transition-colors"
            >
              Message guide
            </Link>
            <Link
              href="/protests#event-list"
              className="inline-flex items-center justify-center rounded-xl bg-[#f9e04c] px-6 py-3 text-sm sm:text-base font-bold text-[#1a1a1a] hover:bg-[#f5d84a] transition-colors"
            >
              Find a protest
            </Link>
            <Link
              href="/join"
              className="inline-flex items-center justify-center rounded-xl border border-[#f9e04c]/40 px-6 py-3 text-sm sm:text-base font-medium text-[#f9e04c] hover:bg-[#f9e04c]/10 transition-colors"
            >
              Join us
            </Link>
          </div>
        </motion.section>
      </main>
    </div>
  )
}
