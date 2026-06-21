import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { catalogProducts, getProductBySlug, legacyProductSlugRedirects } from '@/lib/products'
import ProductDetail from './ProductDetail'
import ProductSlugRedirect from './ProductSlugRedirect'

const CANONICAL_SITE_URL = 'https://protectont.ca'
const basePath = process.env.BASE_PATH || process.env.NEXT_PUBLIC_BASE_PATH || ''

function absoluteAssetUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${CANONICAL_SITE_URL}${basePath}${normalized}`
}

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

export function generateMetadata({ params }: PageProps): Metadata {
  const redirectTarget = legacyProductSlugRedirects[params.slug]
  const slug = redirectTarget ?? params.slug
  const product = catalogProducts.find((p) => p.slug === slug)
  if (!product) return {}

  const ogImage = absoluteAssetUrl(product.image)
  const pageUrl = `${CANONICAL_SITE_URL}${basePath}/products/${product.slug}`

  return {
    title: `${product.name} — Protect Ontario`,
    description: product.summary,
    openGraph: {
      title: product.name,
      description: product.summary,
      url: pageUrl,
      siteName: 'Protect Ontario',
      type: 'website',
      images: [
        {
          url: ogImage,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.summary,
      images: [{ url: ogImage, alt: product.name }],
    },
  }
}

export default function ProductPage({ params }: PageProps) {
  const redirectTarget = legacyProductSlugRedirects[params.slug]
  if (redirectTarget) {
    return <ProductSlugRedirect targetSlug={redirectTarget} />
  }

  const product = getProductBySlug(params.slug)
  if (!product) notFound()
  return <ProductDetail product={product} />
}
