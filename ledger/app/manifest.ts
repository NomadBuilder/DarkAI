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
        sizes: '32x32',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `${basePath}/favicon-192.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: `${basePath}/shield-icon.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
