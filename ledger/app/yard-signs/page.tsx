'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Legacy path — use /products */
export default function YardSignsRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/products#yard-signs')
  }, [router])
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-light text-sm p-8">
      Redirecting to products…
    </div>
  )
}
