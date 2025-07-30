import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects: async () => [
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
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
