import type { MetadataRoute } from 'next'

const basePath = process.env.BASE_PATH || process.env.NEXT_PUBLIC_BASE_PATH || ''

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Protect Ontario — Public accountability in Ontario',
    short_name: 'ProtectOnt',
    description: 'Track public spending, policy impacts, protests, and public land in Ontario using open sources.',
    start_url: basePath || '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: `${basePath}/favicon.png`,
        sizes: '218x228',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
