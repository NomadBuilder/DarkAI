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
  /** Extra copy below the checkout button */
  checkoutHint?: string
  sortOrder: number
}

export const YARD_SIGN_STRIPE_CHECKOUT_URL =
  'https://buy.stripe.com/dRm3cvdHKeh76Nsfdm4gg01'

export const YARD_SIGN_SIZES = ['24" × 18"', '18" × 12"'] as const

export const productCategories: ProductCategory[] = [
  {
    id: 'yard-signs',
    label: 'Yard signs',
    description:
      'Ford Failed You — healthcare, education, transparency. Printed with a stand in your choice of size. Delivered by organizers in your area—not shipped by mail.',
  },
]

export const catalogProducts: CatalogProduct[] = [
  {
    slug: 'ford-failed-you',
    name: 'Ford Failed You — Protest Yard Sign',
    categoryId: 'yard-signs',
    categoryLabel: 'Yard sign',
    image: '/products/yard-signs/ford-failed-you.png',
    summary:
      'Healthcare · Education · Transparency. $10 per sign with stand—choose 24″ × 18″ or 18″ × 12″ when you order or sign up.',
    specs: [
      'One design: Healthcare · Education · Transparency — Ford Failed You!',
      'Sizes: 24″ × 18″ or 18″ × 12″ (select on the sign-up form or note at checkout)',
      'Stand included',
      'Delivered by a local organizer—not shipped by mail',
    ],
    themes: ['Healthcare', 'Education', 'Transparency'],
    minPriceCad: 10,
    stripeCheckoutUrl: YARD_SIGN_STRIPE_CHECKOUT_URL,
    checkoutHint: 'Mention your preferred size (24″ × 18″ or 18″ × 12″) in the order notes if prompted.',
    sortOrder: 1,
  },
]

/** Legacy slugs — redirect to the current yard sign product */
export const legacyProductSlugRedirects: Record<string, string> = {
  'ford-design-1': 'ford-failed-you',
  'ford-design-2': 'ford-failed-you',
  'ford-yard-sign-1': 'ford-failed-you',
  'ford-yard-sign-2': 'ford-failed-you',
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
