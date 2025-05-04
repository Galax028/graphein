import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/client',
        destination: '/client/dashboard',
        permanent: true,
      },
      {
        source: '/merchant',
        destination: '/merchant/dashboard',
        permanent: true,
      },
    ]
  },
  reactStrictMode: true,
};

export default nextConfig;
