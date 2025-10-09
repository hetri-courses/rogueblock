/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === 'production' ? '/rogueblock' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/rogueblock/' : '',
}

module.exports = nextConfig
