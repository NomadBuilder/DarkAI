'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Legacy path — signup lives at /join */
export default function GetInvolvedRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/join')
  }, [router])
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-light text-sm p-8">
      Redirecting to join…
    </div>
  )
}
