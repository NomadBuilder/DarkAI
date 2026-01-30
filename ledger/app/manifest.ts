import type { MetadataRoute } from 'next'

const basePath = process.env.BASE_PATH || process.env.NEXT_PUBLIC_BASE_PATH || ''

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Protect Ontario — Accountability for the Ford Government',
    short_name: 'ProtectOnt',
    description: 'An interactive visualization of how public money in Ontario shifted toward private, for-profit delivery during the Ford era.',
    start_url: basePath || '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: `${basePath}/shield-icon.png`,
        sizes: 'any',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
