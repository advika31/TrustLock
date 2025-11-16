/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    includePaths: ['./styles'],
  },
  images: {
    // Allow unoptimized images for mock mode and local development
    unoptimized: process.env.NEXT_PUBLIC_MOCK === 'true',
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Disable console in production builds (except in mock mode)
  webpack: (config, { dev, isServer }) => {
    if (!dev && !process.env.NEXT_PUBLIC_MOCK) {
      config.optimization.minimizer = config.optimization.minimizer || [];
    }
    return config;
  },
};

module.exports = nextConfig;

