/** Core flyers bundled for door-to-door / tabling — keep in sync with build-flyer-print-pack.mjs */
export const FLYER_PRINT_PACK_SLUGS = [
  'overview',
  'healthcare',
  'water',
  'public-land',
  'accountability',
] as const

export type FlyerPrintPackSlug = (typeof FLYER_PRINT_PACK_SLUGS)[number]

export const FLYER_PRINT_PACK_ITEMS: { slug: FlyerPrintPackSlug; label: string }[] = [
  { slug: 'overview', label: 'Overview Flyer' },
  { slug: 'healthcare', label: 'Healthcare' },
  { slug: 'water', label: 'Water' },
  { slug: 'public-land', label: 'Public Land' },
  { slug: 'accountability', label: 'Accountability' },
]

export const FLYER_PRINT_PACK_ZIP_PATH = '/downloads/community-action-pack.zip'
export const FLYER_PRINT_PACK_ZIP_FILENAME = 'protectont-community-action-pack.zip'
