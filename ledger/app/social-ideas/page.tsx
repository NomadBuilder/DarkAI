'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Public /social-ideas removed — organizers use /admin?section=social-posts */
export default function SocialIdeasRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/materials')
  }, [router])
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-light text-sm p-8">
      Redirecting…
    </div>
  )
}
