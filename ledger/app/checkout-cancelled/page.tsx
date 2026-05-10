'use client'

import Link from 'next/link'
import TopNavigation from '../../components/TopNavigation'

export default function CheckoutCancelledPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <TopNavigation />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 md:py-24 text-center">
        <h1 className="text-3xl font-light text-slate-900 mb-4">Checkout cancelled</h1>
        <p className="text-slate-600 font-light leading-relaxed mb-10">
          No charge was made. You can return to the sign generator and try again anytime.
        </p>
        <Link
          href="/signs"
          className="text-blue-600 hover:text-blue-700 font-light underline underline-offset-4"
        >
          Back to Sign Generator
        </Link>
      </main>
    </div>
  )
}
