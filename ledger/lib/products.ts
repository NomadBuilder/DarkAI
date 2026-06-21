export type ProductCategoryId = 'yard-signs' | 'apparel'

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
  /** Show “Coming soon” instead of Stripe checkout */
  comingSoon?: boolean
  /** Email for pre-orders when comingSoon is true */
  contactEmail?: string
  /** Additional product photos on the detail page */
  galleryImages?: string[]
  sortOrder: number
}

export const YARD_SIGN_STRIPE_CHECKOUT_URL =
  'https://buy.stripe.com/dRm3cvdHKeh76Nsfdm4gg01'

export const YARD_SIGN_SIZES = ['24" × 18"', '18" × 12"'] as const

export const productCategories: ProductCategory[] = [
  {
    id: 'apparel',
    label: 'Apparel',
    description:
      'Wear your message. White crew-neck tee with a bold halftone graphic—unisex sizing. Email us to reserve yours while online checkout is being set up.',
  },
  {
    id: 'yard-signs',
    label: 'Yard signs',
    description:
      'Ford Failed You — healthcare, education, transparency. Printed with a stand in your choice of size. Delivered by organizers in your area—not shipped by mail.',
  },
]

export const catalogProducts: CatalogProduct[] = [
  {
    slug: 'fight-ford-t-shirt',
    name: 'Ford Sucks T-shirt',
    categoryId: 'apparel',
    categoryLabel: 'T-shirt',
    image: '/products/t-shirts/ford-sucks.png',
    galleryImages: ['/products/t-shirts/ford-sucks-group.png'],
    summary:
      'White unisex crew-neck tee with a halftone portrait graphic and bold “SUCKS” type. Coming soon—email to reserve yours.',
    specs: [
      'White short-sleeve crew-neck T-shirt',
      'Halftone portrait graphic with “SUCKS” in bold type',
      'Unisex fit — available in common adult sizes (confirm when you email)',
      'Pickup or delivery coordinated after you order',
    ],
    minPriceCad: 0,
    stripeCheckoutUrl: null,
    comingSoon: true,
    contactEmail: 'ford_sucks_tee@proton.me',
    sortOrder: 0,
  },
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

export const legacyYardSignSlugRedirects: Record<string, string> = {
  'ford-design-1': 'ford-failed-you',
  'ford-design-2': 'ford-failed-you',
  'ford-yard-sign-1': 'ford-failed-you',
  'ford-yard-sign-2': 'ford-failed-you',
}

/** Legacy /products/[slug] URLs → current product slug (includes yard-sign aliases). */
export const legacyProductSlugRedirects: Record<string, string> = {
  'ford-sucks': 'fight-ford-t-shirt',
  ...legacyYardSignSlugRedirects,
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
