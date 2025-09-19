import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during builds
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'https://azaya-backend.vercel.app/api/auth/:path*',
      },
      {
        source: '/api/documents/:path*',
        destination: 'https://azaya-backend.vercel.app/api/documents/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'https://azaya-backend.vercel.app/api/:path*',
      },
    ];
  },
};

export default nextConfig;
