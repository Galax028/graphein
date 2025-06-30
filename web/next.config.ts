import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/client",
        destination: "/glance",
        permanent: true,
      },
      {
        source: "/order/new",
        destination: "/order/new/upload",
        permanent: true,
      },
      {
        source: "/merchant",
        destination: "/merchant/dashboard",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "7625945536e42a812439c01fe96f0361.r2.cloudflarestorage.com",
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
