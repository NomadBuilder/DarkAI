'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Old path; nav and links use /support */
export default function ShopRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/support')
  }, [router])
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-light text-sm p-8">
      Redirecting to support…
    </div>
  )
}
