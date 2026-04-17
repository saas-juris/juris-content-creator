import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  // Serve brand-assets from /storage/brand-assets via /brand-assets URL
  async rewrites() {
    return [
      {
        source: '/brand-assets/:path*',
        destination: '/api/serve-asset/:path*',
      },
    ]
  },
  // Allow server-side only packages (puppeteer, prisma)
  serverExternalPackages: ['puppeteer', '@prisma/client', '@prisma/adapter-libsql', '@libsql/client'],
}

export default nextConfig
