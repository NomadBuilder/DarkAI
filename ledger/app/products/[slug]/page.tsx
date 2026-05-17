import { notFound } from 'next/navigation'
import { catalogProducts, getProductBySlug, legacyProductSlugRedirects } from '@/lib/products'
import ProductDetail from './ProductDetail'

export function generateStaticParams() {
  const slugs = new Set(catalogProducts.map((p) => p.slug))
  for (const legacy of Object.keys(legacyProductSlugRedirects)) {
    slugs.add(legacy)
  }
  return [...slugs].map((slug) => ({ slug }))
}

type PageProps = {
  params: { slug: string }
}

export default function ProductPage({ params }: PageProps) {
  const product = getProductBySlug(params.slug)
  if (!product) notFound()
  return <ProductDetail product={product} />
}
