'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import TopNavigation from '../../components/TopNavigation'
import ProductCard from '../../components/products/ProductCard'
import { catalogProducts, getProductsByCategory, productCategories } from '@/lib/products'

export default function ProductsPage() {
  const hasProducts = catalogProducts.length > 0

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopNavigation />

      <header className="border-b border-slate-200 bg-gradient-to-br from-slate-950 via-[#152a45] to-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-28 sm:pb-20">
          <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-blue-200/90 mb-4 font-medium">
            Community products
          </p>
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight leading-tight mb-5">
            Materials you can order
          </h1>
          <p className="text-lg text-slate-200/95 font-light max-w-2xl leading-relaxed">
            Ready-made protest materials, fulfilled by organizers and volunteers. Pay what you can above the minimum—every
            dollar supports printing, stands, and local delivery.
          </p>
          <p className="mt-6 text-sm text-slate-300/90 font-light">
            Looking for DIY builders?{' '}
            <Link href="/support" className="text-white underline-offset-4 hover:underline">
              Visit support materials
            </Link>
            {' '}for posters, shirts, stickers, and print-at-home signs.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-16">
        {hasProducts ? (
          productCategories.map((category) => {
            const items = getProductsByCategory(category.id)
            if (items.length === 0) return null
            return (
              <section key={category.id} id={category.id} className="scroll-mt-28">
                <h2 className="text-2xl sm:text-3xl font-light text-slate-900 mb-2">{category.label}</h2>
                <p className="text-sm text-slate-600 font-light leading-relaxed max-w-2xl mb-8">{category.description}</p>
                <div className="grid gap-8 md:grid-cols-2">
                  {items.map((product, i) => (
                    <ProductCard key={product.slug} product={product} index={i} />
                  ))}
                </div>
              </section>
            )
          })
        ) : (
          <p className="text-slate-600 font-light">New products are on the way. Check back soon.</p>
        )}

        <section className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
          <h2 className="text-lg font-medium text-slate-900 mb-3">How it works</h2>
          <ul className="space-y-3 text-sm text-slate-600 font-light leading-relaxed list-disc pl-5">
            <li>Choose a product and pick a suggested contribution—or enter your own on Stripe.</li>
            <li>Complete checkout online or coordinate with your local organizer when noted.</li>
            <li>Receive your item through volunteer delivery or fulfilment described on each product page.</li>
          </ul>
        </section>
      </main>
    </div>
  )
}
