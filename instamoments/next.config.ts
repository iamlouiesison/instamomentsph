import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    // Handle Supabase modules properly
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@supabase/supabase-js': '@supabase/supabase-js/dist/main/index.js',
      };
    }

    return config;
  },
};

export default nextConfig;
