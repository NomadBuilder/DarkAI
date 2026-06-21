'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  targetSlug: string
}

/** Canonicalize legacy /products/[slug] URLs to the current product slug. */
export default function ProductSlugRedirect({ targetSlug }: Props) {
  const router = useRouter()

  useEffect(() => {
    router.replace(`/products/${targetSlug}`)
  }, [router, targetSlug])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-light text-sm p-8">
      Redirecting…
    </div>
  )
}
