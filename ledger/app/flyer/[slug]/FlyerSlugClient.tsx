'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getPublicDataFile } from '@/utils/dataPath'
import { getFlyerBySlug, parseFlyersFile } from '@/lib/flyers'
import FlyerPrintView from '@/components/flyers/FlyerPrintView'

export default function FlyerSlugClient({ slug }: { slug: string }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading')
  const [flyer, setFlyer] = useState<ReturnType<typeof getFlyerBySlug>>(undefined)
  const [shared, setShared] = useState(parseFlyersFile(null).shared)

  useEffect(() => {
    let cancelled = false
    fetch(getPublicDataFile('flyers.json'), { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (cancelled) return
        const file = parseFlyersFile(data)
        setShared(file.shared)
        const found = getFlyerBySlug(file, slug)
        setFlyer(found)
        setStatus(found ? 'ready' : 'missing')
      })
      .catch(() => {
        if (!cancelled) setStatus('missing')
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#2a1f58] flex items-center justify-center text-[#f9e04c]/70 text-sm font-light">
        Loading flyer…
      </div>
    )
  }

  if (status === 'missing' || !flyer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#3d2b7a] to-[#2a1f58] px-4 py-20 text-center">
        <p className="text-[#f9e04c] text-lg font-light mb-4">Flyer not found.</p>
        <Link href="/flyer" className="text-sm text-white/80 underline hover:text-white">
          View all flyers
        </Link>
      </div>
    )
  }

  return <FlyerPrintView flyer={flyer} shared={shared} />
}
