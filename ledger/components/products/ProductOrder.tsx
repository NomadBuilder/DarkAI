'use client'

import { useState } from 'react'
import type { CatalogProduct } from '@/lib/products'

type Props = {
  product: CatalogProduct
}

const SUGGESTED_AMOUNTS = [8, 15, 25, 50] as const

export default function ProductOrder({ product }: Props) {
  const min = product.minPriceCad
  const [amount, setAmount] = useState<number>(min)
  const [customMode, setCustomMode] = useState(false)
  const [customInput, setCustomInput] = useState('')

  const effectiveAmount = customMode
    ? Math.max(min, Math.floor(Number(customInput) || 0))
    : amount

  const checkoutReady = Boolean(product.stripeCheckoutUrl)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-[#9f1239] font-medium mb-2">Support the cause</p>
        <h2 className="text-xl font-light text-slate-900 mb-2">Choose your contribution</h2>
        <p className="text-sm text-slate-600 font-light leading-relaxed">
          Minimum <strong className="font-medium text-slate-800">${min} CAD</strong>. Pay more if you can—it helps
          cover materials, printing, and volunteer delivery.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTED_AMOUNTS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => {
              setCustomMode(false)
              setAmount(n)
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !customMode && amount === n
                ? 'bg-[#2E4A6B] text-white'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            ${n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setCustomMode(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            customMode ? 'bg-[#2E4A6B] text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Other amount
        </button>
      </div>

      {customMode ? (
        <label className="block text-sm text-slate-600">
          Amount (CAD, minimum ${min})
          <input
            type="number"
            min={min}
            step={1}
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            className="mt-1 block w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
      ) : null}

      <p className="text-sm text-slate-700">
        Your selection: <strong className="font-medium">${effectiveAmount} CAD</strong>
      </p>

      {checkoutReady ? (
        <div className="space-y-2">
          <a
            href={product.stripeCheckoutUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex justify-center rounded-xl bg-gradient-to-r from-[#9f1239] to-[#7f1230] px-6 py-3.5 text-sm font-medium text-white shadow-md hover:opacity-95"
          >
            Continue to checkout
          </a>
          <p className="text-xs text-slate-500 font-light">
            You will enter your contribution on Stripe (minimum ${min} CAD).
            {product.checkoutHint ? ` ${product.checkoutHint}` : null}
          </p>
        </div>
      ) : (
        <div className="rounded-xl bg-slate-100 border border-slate-200 px-4 py-3 text-sm text-slate-600 font-light">
          Online checkout for this item is being connected. Check back soon—or contact your local organizer.
        </div>
      )}
    </section>
  )
}
