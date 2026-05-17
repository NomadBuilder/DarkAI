'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import TopNavigation from '../../../components/TopNavigation'
import ProductOrder from '../../../components/products/ProductOrder'
import type { CatalogProduct } from '@/lib/products'
import { getRelatedProducts } from '@/lib/products'

type Props = {
  product: CatalogProduct
}

export default function ProductDetail({ product }: Props) {
  const related = getRelatedProducts(product)

  return (
    <motion.div className="min-h-screen bg-slate-50 text-slate-900">
      <TopNavigation />

      <header className="border-b border-slate-200 bg-gradient-to-br from-slate-950 via-[#152a45] to-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 sm:pt-28">
          <Link
            href="/products"
            className="inline-flex text-sm text-blue-200/90 hover:text-white mb-6 transition-colors"
          >
            ← All products
          </Link>
          <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-blue-200/90 mb-3 font-medium">
            {product.categoryLabel}
            {product.variantLabel ? ` · ${product.variantLabel}` : ''}
          </p>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight leading-tight">{product.name}</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="grid gap-10 lg:grid-cols-2 lg:gap-14 items-start"
        >
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-md shadow-slate-900/5">
            <div className="relative aspect-[4/3] bg-slate-100">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain p-2 sm:p-3"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-medium text-slate-900 mb-3">What you get</h2>
              <ul className="space-y-2 text-sm text-slate-600 font-light leading-relaxed">
                {product.specs.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>

            <ProductOrder product={product} />

            {related.length > 0 ? (
              <div className="text-sm text-slate-600 font-light">
                <p className="mb-2 font-medium text-slate-800">Also available</p>
                <ul className="space-y-1">
                  {related.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/products/${p.slug}`} className="text-[#2E4A6B] hover:underline">
                        {p.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </motion.div>
      </main>
    </motion.div>
  )
}
