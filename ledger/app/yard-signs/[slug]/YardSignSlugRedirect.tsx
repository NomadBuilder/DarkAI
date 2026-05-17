'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getProductBySlug } from '@/lib/products'

/** Legacy /yard-signs/[slug] → /products/[slug] */
export default function YardSignSlugRedirect() {
  const router = useRouter()
  const params = useParams()
  const slug = typeof params.slug === 'string' ? params.slug : ''

  useEffect(() => {
    const product = getProductBySlug(slug)
    if (product) {
      router.replace(`/products/${product.slug}`)
    } else {
      router.replace('/products')
    }
  }, [router, slug])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-light text-sm p-8">
      Redirecting…
    </div>
  )
}
