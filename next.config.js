/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  trailingSlash: process.env.NODE_ENV === 'production',
  images: {
    unoptimized: process.env.NODE_ENV === 'production'
  },
  basePath: '/rogueblock',
  assetPrefix: '/rogueblock/'
}

module.exports = nextConfig
