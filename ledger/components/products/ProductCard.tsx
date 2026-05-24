'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { CatalogProduct } from '@/lib/products'

type Props = {
  product: CatalogProduct
  index?: number
}

const fade = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5 },
}

export default function ProductCard({ product, index = 0 }: Props) {
  return (
    <motion.article
      {...fade}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md shadow-slate-900/5 flex flex-col"
    >
      <div className="relative aspect-[4/3] bg-slate-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-2 sm:p-3"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={index === 0}
        />
      </div>
      <div className="p-5 md:p-6 flex flex-col flex-grow">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">{product.categoryLabel}</p>
        <h3 className="text-2xl font-light text-slate-900 mb-2">{product.name}</h3>
        <p className="text-sm text-[#2E4A6B] font-medium mb-3">${product.minPriceCad} CAD</p>
        <p className="text-sm text-slate-600 font-light leading-relaxed mb-4">{product.summary}</p>
        <Link
          href={`/products/${product.slug}`}
          className="mt-auto inline-flex justify-center rounded-xl bg-gradient-to-r from-[#9f1239] to-[#7f1230] px-5 py-3 text-sm font-medium text-white shadow-md hover:opacity-95 transition-opacity"
        >
          View details
        </Link>
      </div>
    </motion.article>
  )
}
