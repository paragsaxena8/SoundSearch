/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.gaanacdn.com',
      },
      {
        protocol: 'https',
        hostname: 'a10.gaanacdn.com',
      },
    ],
  },
}

export default nextConfig