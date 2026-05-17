export type ProductCategoryId = 'yard-signs'

export type ProductCategory = {
  id: ProductCategoryId
  label: string
  description: string
}

export type CatalogProduct = {
  slug: string
  name: string
  categoryId: ProductCategoryId
  /** Short label on cards, e.g. "Yard sign" */
  categoryLabel: string
  image: string
  /** One-line listing blurb */
  summary: string
  /** Detail page bullets under "What you get" */
  specs: string[]
  themes?: string[]
  minPriceCad: number
  stripeCheckoutUrl: string | null
  /** Optional detail header line, e.g. "Design #1" */
  variantLabel?: string
  /** Extra copy below the checkout button */
  checkoutHint?: string
  sortOrder: number
}

export const YARD_SIGN_STRIPE_CHECKOUT_URL =
  'https://buy.stripe.com/dRm3cvdHKeh76Nsfdm4gg01'

export const productCategories: ProductCategory[] = [
  {
    id: 'yard-signs',
    label: 'Yard signs',
    description:
      'Ready-made protest designs, printed at 18 × 24 in with a stand. Delivered by organizers in your area—not shipped by mail.',
  },
]

export const catalogProducts: CatalogProduct[] = [
  {
    slug: 'ford-yard-sign-1',
    name: 'Ford Sign Design #1',
    categoryId: 'yard-signs',
    categoryLabel: 'Yard sign',
    image: '/products/yard-signs/ford-design-1.png',
    summary: 'Healthcare, education, and environment. 18 × 24 in with stand—delivered by your local organizer.',
    specs: [
      '18 × 24 in printed yard sign',
      'Stand included',
      'Themes: Healthcare · Education · Environment',
      'Delivered by a local organizer—not shipped by mail',
    ],
    themes: ['Healthcare', 'Education', 'Environment'],
    minPriceCad: 8,
    stripeCheckoutUrl: YARD_SIGN_STRIPE_CHECKOUT_URL,
    variantLabel: 'Design #1',
    checkoutHint: 'Mention Design #1 in the order notes if prompted.',
    sortOrder: 1,
  },
  {
    slug: 'ford-yard-sign-2',
    name: 'Ford Sign Design #2',
    categoryId: 'yard-signs',
    categoryLabel: 'Yard sign',
    image: '/products/yard-signs/ford-design-2.png',
    summary: 'Healthcare, education, and transparency. 18 × 24 in with stand—delivered by your local organizer.',
    specs: [
      '18 × 24 in printed yard sign',
      'Stand included',
      'Themes: Healthcare · Education · Transparency',
      'Delivered by a local organizer—not shipped by mail',
    ],
    themes: ['Healthcare', 'Education', 'Transparency'],
    minPriceCad: 8,
    stripeCheckoutUrl: YARD_SIGN_STRIPE_CHECKOUT_URL,
    variantLabel: 'Design #2',
    checkoutHint: 'Mention Design #2 in the order notes if prompted.',
    sortOrder: 2,
  },
]

/** Legacy slugs from /yard-signs/* — keep redirects working */
export const legacyProductSlugRedirects: Record<string, string> = {
  'ford-design-1': 'ford-yard-sign-1',
  'ford-design-2': 'ford-yard-sign-2',
}

export function getProductBySlug(slug: string): CatalogProduct | undefined {
  const resolved = legacyProductSlugRedirects[slug] ?? slug
  return catalogProducts.find((p) => p.slug === resolved)
}

export function getProductsByCategory(categoryId: ProductCategoryId): CatalogProduct[] {
  return catalogProducts
    .filter((p) => p.categoryId === categoryId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getRelatedProducts(product: CatalogProduct, limit = 3): CatalogProduct[] {
  return catalogProducts
    .filter((p) => p.slug !== product.slug)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, limit)
}
