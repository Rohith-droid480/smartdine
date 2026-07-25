import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Transpile the shared package so Next.js can process its TypeScript
  transpilePackages: ['@smartdine/shared'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },

  // Expose public env vars — prefix with NEXT_PUBLIC_
  env: {
    NEXT_PUBLIC_API_URL: process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000',
  },
};

export default nextConfig;
