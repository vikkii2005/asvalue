/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove experimental features causing errors
  // experimental: {
  //   optimizeCss: true,
  //   optimizePackageImports: ['lucide-react', 'firebase'],
  // },

  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    formats: ['image/webp', 'image/avif'],
  },
}

module.exports = nextConfig