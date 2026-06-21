'use client'

import type { CatalogProduct } from '@/lib/products'

type Props = {
  product: CatalogProduct
}

export default function ProductOrder({ product }: Props) {
  const min = product.minPriceCad
  const checkoutReady = Boolean(product.stripeCheckoutUrl)
  const comingSoon = Boolean(product.comingSoon)
  const contactEmail = product.contactEmail

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-[#9f1239] font-medium mb-2">Support the cause</p>
        <h2 className="text-xl font-light text-slate-900 mb-2">{comingSoon ? 'Availability' : 'Checkout'}</h2>
        {comingSoon ? (
          <p className="text-sm text-slate-600 font-light leading-relaxed">
            This item is not on Stripe yet. Email us to reserve yours and we will follow up with size, price, and
            pickup or delivery details.
          </p>
        ) : (
          <p className="text-sm text-slate-600 font-light leading-relaxed">
            <strong className="font-medium text-slate-800">${min} CAD</strong> per sign—covers materials, printing, and
            volunteer delivery.
          </p>
        )}
      </div>

      {comingSoon ? (
        <div className="space-y-3">
          <span className="inline-flex justify-center rounded-xl bg-slate-200 px-6 py-3.5 text-sm font-medium text-slate-700 cursor-default">
            Coming soon
          </span>
          {contactEmail ? (
            <p className="text-sm text-slate-600 font-light leading-relaxed">
              To purchase, email{' '}
              <a href={`mailto:${contactEmail}`} className="font-medium text-[#2E4A6B] hover:underline">
                {contactEmail}
              </a>
            </p>
          ) : null}
        </div>
      ) : checkoutReady ? (
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
            Checkout on Stripe (${min} CAD).
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
