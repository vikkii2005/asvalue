/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⚡ PERFORMANCE: Remove experimental turbo warning
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'firebase']
  },

  // ⚡ FASTER: Compiler optimizations  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },

  // Image optimization
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

  // ⚡ SECURITY: Non-blocking headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
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
          // ⚡ ADD: DNS prefetch headers
          {
            key: 'Link',
            value: '<//accounts.google.com>; rel=dns-prefetch, <//apis.google.com>; rel=dns-prefetch'
          }
        ],
      },
    ]
  },

  // ⚡ OPTIMIZED: Better bundle splitting
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // ⚡ FASTER: Aggressive bundle splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 250000,
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
      
      // ⚡ FASTER: Tree shaking
      config.optimization.usedExports = true;
    }
    return config;
  },

  env: {
    CUSTOM_KEY: 'asvalue-production-ready',
  },
}

module.exports = nextConfig;