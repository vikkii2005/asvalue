/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'firebase'],
  },

  // ✅ POPUP FRIENDLY: Headers that allow popups
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // ✅ POPUP OPTIMIZED: Allow popups but secure
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          // ✅ SPEED: Preconnect headers
          {
            key: 'Link',
            value:
              '<https://accounts.google.com>; rel=preconnect, <https://apis.google.com>; rel=preconnect',
          },
        ],
      },
    ]
  },

  // PostHog rewrites
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
      {
        source: '/ingest/flags',
        destination: 'https://us.i.posthog.com/flags',
      },
    ]
  },

  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,

  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    formats: ['image/webp', 'image/avif'],
  },

  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          firebase: {
            test: /[\\/]node_modules[\\/](firebase)[\\/]/,
            name: 'firebase',
            priority: 10,
          },
        },
      }
    }
    return config
  },
}

module.exports = nextConfig
