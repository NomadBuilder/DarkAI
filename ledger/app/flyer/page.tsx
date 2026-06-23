'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
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
    <div className="min-h-screen bg-gradient-to-b from-[#3d2b7a] to-[#2a1f58] py-10 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-light text-[#f9e04c]/80 hover:text-[#f9e04c]">
          ← ProtectOnt.ca
        </Link>
        <h1 className="mt-6 text-3xl sm:text-4xl font-light text-[#f9e04c] tracking-tight">
          Printable awareness flyers
        </h1>
        <p className="mt-3 text-[#f9e04c]/85 font-light leading-relaxed max-w-xl text-base sm:text-lg">
          Full letter-size (8.5″×11″) posters for community boards, doors, and events. Each issue
          flyer includes detailed bullets and sources — open one, then print or save as PDF.
        </p>

        {loading ? (
          <p className="mt-10 text-sm text-[#f9e04c]/60 font-light">Loading…</p>
        ) : flyers.length === 0 ? (
          <p className="mt-10 text-sm text-[#f9e04c]/60 font-light">No flyers published yet.</p>
        ) : (
          <ul className="mt-10 space-y-3">
            {flyers.map((f) => (
              <li key={f.id}>
                <Link
                  href={`/flyer/${f.slug}`}
                  className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-[#f9e04c]/25 bg-white/10 px-5 py-4 hover:border-[#f9e04c]/50 hover:bg-white/15 transition-colors"
                >
                  <div>
                    <p className="text-xl sm:text-2xl font-semibold text-[#f9e04c] group-hover:text-white transition-colors">
                      {f.title} {f.subtitle}
                    </p>
                    {f.intro && (
                      <p className="mt-1 text-sm text-[#f9e04c]/70 font-light line-clamp-2">{f.intro}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm font-medium text-white/90 group-hover:text-white">
                    Open &amp; print →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
