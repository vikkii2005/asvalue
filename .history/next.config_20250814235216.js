/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'firebase']
  },

  // ✅ COMPREHENSIVE COOP FIX
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers (existing)
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // ✅ ENHANCED: More permissive COOP for Firebase Auth
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'unsafe-none', // More permissive for auth popups
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          // ✅ ENHANCED: Allow cross-origin for Firebase
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
          // Preload domains
          {
            key: 'Link',
            value: [
              '<https://accounts.google.com>; rel=preconnect; crossorigin',
              '<https://apis.google.com>; rel=preconnect; crossorigin', 
              '<https://ssl.gstatic.com>; rel=preconnect; crossorigin',
              '<https://www.gstatic.com>; rel=preconnect; crossorigin'
            ].join(', ')
          }
        ],
      },
      // ✅ SPECIFIC: Firebase auth domain headers
      {
        source: '/api/auth/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
        ],
      },
    ]
  },

  // Images and webpack config (existing)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
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
            chunks: 'all',
            priority: 10,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 5,
          },
        },
      };
    }
    return config;
  },

  env: {
    CUSTOM_KEY: 'asvalue-production-ready',
  },
}

module.exports = nextConfig;