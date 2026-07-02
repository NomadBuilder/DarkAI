'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function IndigenousLegacyRedirect() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const current = pathname ?? '/indigenous'
    const target = current.replace(/^\/indigenous/, '/stand4land')
    const withSlash = target.endsWith('/') ? target : `${target}/`
    router.replace(withSlash)
  }, [pathname, router])

  return (
    <div className="min-h-[40vh] flex items-center justify-center text-sm text-slate-500 font-light">
      Redirecting…
    </div>
  )
}
