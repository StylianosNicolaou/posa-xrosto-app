/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Set Turbopack root to this project directory
  turbopack: {
    root: process.cwd(),
  },
  
  // Ensure proper static file handling
  trailingSlash: false,
  
  // PWA headers
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ]
  },
  
  // Enable type checking and linting during build
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
