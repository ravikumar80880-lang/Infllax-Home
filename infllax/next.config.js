/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['infllax.com'],
    formats: ['image/avif', 'image/webp'],
  },
}

module.exports = nextConfig
