/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    NEXT_PUBLIC_MEDIA_URL: process.env.NEXT_PUBLIC_MEDIA_URL || 'http://localhost:8000/media',
  },
  images: {
    domains: ['localhost', '127.0.0.1'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Skip static generation for registration pages
  generateBuildId: async () => {
    return 'build-' + Date.now()
  },
  trailingSlash: false,
  output: 'standalone',
}

export default nextConfig