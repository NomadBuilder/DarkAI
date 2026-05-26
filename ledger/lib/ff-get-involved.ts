/** Friends / campaign get-involved page — colors and assets */

export const FF_COLORS = {
  background: '#d35400',
  backgroundDeep: '#9a3d08',
  text: '#f9e04c',
  headingBg: '#f9e04c',
  headingText: '#1a1a1a',
  link: '#fff4d6',
  linkHover: '#ffffff',
  accent: '#ff9a3c',
} as const

export const FF_PAGE_GRADIENT =
  'linear-gradient(168deg, #f59a4a 0%, #e86f1a 18%, #d35400 42%, #b8470a 68%, #9a3d08 100%)'

/** Printable yard-sign artwork (served from ledger/public) */
export const FF_YARD_SIGN_DESIGNS = [
  {
    id: 'ford-design-1',
    title: 'Healthcare · Education · Environment',
    imageUrl: '/products/yard-signs/ford-design-1.png',
    downloadUrl: '/products/yard-signs/ford-design-1.png',
    filename: 'ford-design-1.png',
  },
  {
    id: 'ford-design-2',
    title: 'Healthcare · Education · Transparency',
    imageUrl: '/products/yard-signs/ford-design-2.png',
    downloadUrl: '/products/yard-signs/ford-design-2.png',
    filename: 'ford-design-2.png',
  },
] as const

export const FF_SOURCE_PAGE = 'ff-get-involved'

export const FF_INTRO = [
  'Thank you for joining our cause. Together, we can make a difference.',
  "We are a growing grassroots group powered by volunteers and community support. As we continue to expand, we're building new delivery networks, sign pickup hubs, and local connections across Ontario.",
  "Thank you for your patience as we grow. We may still be building resources in your area, but we'll work with you to find the best way to get a sign to you.",
] as const
