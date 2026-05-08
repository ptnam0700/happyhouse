import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Treat missing env vars as build errors in production
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? '',
  },

  // Allow Supabase Storage images if you ever use next/image with them
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
