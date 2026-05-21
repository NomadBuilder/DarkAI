'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Legacy path — event updates live at /admin-events */
export default function AdminRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/admin-events')
  }, [router])
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-light text-sm p-8">
      Redirecting to event updates…
    </div>
  )
}
