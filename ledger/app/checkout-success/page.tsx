'use client'

import Link from 'next/link'
import { Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import TopNavigation from '../../components/TopNavigation'

function CheckoutSuccessInner() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const summary = useMemo(() => {
    if (!sessionId) return 'Your payment was received.'
    return 'Your payment was received. Stripe will email your receipt; we will prepare your Printful order for fulfilment.'
  }, [sessionId])

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNavigation />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 md:py-24 text-center">
        <h1 className="text-3xl font-light text-slate-900 mb-4">Thank you</h1>
        <p className="text-slate-600 font-light leading-relaxed mb-8">{summary}</p>
        {sessionId ? (
          <p className="text-xs text-slate-400 font-mono break-all mb-10">Reference: {sessionId}</p>
        ) : null}
        <Link href="/" className="text-blue-600 hover:text-blue-700 font-light underline underline-offset-4">
          Back to home
        </Link>
      </main>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-light">
          Loading…
        </div>
      }
    >
      <CheckoutSuccessInner />
    </Suspense>
  )
}
