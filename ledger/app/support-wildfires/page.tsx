'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Legacy slug — use /support-for-wildfires/ */
export default function SupportWildfiresRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/support-for-wildfires/')
  }, [router])
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-light text-sm p-8">
      Redirecting…
    </div>
  )
}
