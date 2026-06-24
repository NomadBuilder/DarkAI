'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { flyerPath } from '@/lib/flyer-routes'

export function FlyerIndexRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace(flyerPath())
  }, [router])
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-light text-sm p-8">
      Redirecting to flyers…
    </div>
  )
}

export function FlyerSlugRedirect({ slug }: { slug: string }) {
  const router = useRouter()
  useEffect(() => {
    router.replace(flyerPath(slug))
  }, [router, slug])
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-light text-sm p-8">
      Redirecting to flyers…
    </div>
  )
}
