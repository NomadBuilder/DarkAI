'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Legacy path — use /public-land */
export default function GreenbeltRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/public-land#greenbelt')
  }, [router])
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-light text-sm p-8">
      Redirecting to public land…
    </div>
  )
}
