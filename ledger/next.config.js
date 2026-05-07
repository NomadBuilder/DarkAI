/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production'
const nextConfig = {
  // In dev, never use basePath so script/chunk URLs are root-relative (fixes 404 on page.js for /water, /receipts, etc.)
  ...(isDev ? { basePath: '' } : {}),
  // Never use static export in dev mode - only in production builds
  ...(process.env.NODE_ENV === 'production' && process.env.STATIC_EXPORT === 'true' && { output: 'export' }),
  // Base path for deployment at ProtectOnt.ca (production only; set BASE_PATH for subpath)
  ...(process.env.NODE_ENV === 'production' && process.env.BASE_PATH && { basePath: process.env.BASE_PATH }),
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure webpack doesn't cache broken builds
  webpack: (config, { dev, isServer }) => {
    // Resolve path aliases for webpack - use absolute path resolution
    const path = require('path')
    const projectRoot = path.resolve(__dirname)
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': projectRoot,
    }
    // Also add modules directory to resolve
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      projectRoot,
      path.join(projectRoot, 'node_modules'),
    ]
    
    return config
  },
}

module.exports = nextConfig
