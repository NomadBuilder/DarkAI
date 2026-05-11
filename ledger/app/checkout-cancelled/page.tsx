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
          No charge was made. You can return to the sign or shirt page and try again anytime.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center text-blue-600">
          <Link href="/signs" className="hover:text-blue-700 font-light underline underline-offset-4">
            Sign generator
          </Link>
          <Link href="/shirts#shirt-print" className="hover:text-blue-700 font-light underline underline-offset-4">
            Shirt orders
          </Link>
        </div>
      </main>
    </div>
  )
}
