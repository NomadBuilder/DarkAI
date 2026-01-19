/** @type {import('next').NextConfig} */
const nextConfig = {
  // Never use static export in dev mode - only in production builds
  ...(process.env.NODE_ENV === 'production' && process.env.STATIC_EXPORT === 'true' && { output: 'export' }),
  // Base path for deployment at darkai.ca/ledger
  ...(process.env.BASE_PATH && { basePath: process.env.BASE_PATH }),
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  // Better error handling and hot reloading
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Ensure webpack doesn't cache broken builds
  webpack: (config, { dev, isServer }) => {
    // Resolve path aliases for webpack
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    }
    
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
      // Better error handling in dev
      config.optimization = {
        ...config.optimization,
        minimize: false, // Faster builds in dev
      }
    }
    return config
  },
}

module.exports = nextConfig
