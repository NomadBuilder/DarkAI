'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function FormAdminRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/admin?section=join-form')
  }, [router])
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-light text-sm p-8">
      Redirecting to admin…
    </div>
  )
}
