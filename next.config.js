/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  trailingSlash: process.env.NODE_ENV === 'production',
  images: {
    unoptimized: process.env.NODE_ENV === 'production'
  },
  // Temporarily use /rogueblock prefix in development to match user expectations
  basePath: '/rogueblock',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/rogueblock/' : '',
  // Temporarily disable restrictive headers to allow Twitch embed to work
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          // Minimal headers to allow Twitch embed
          {
            key: 'Permissions-Policy',
            value: 'autoplay=*, encrypted-media=*'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
