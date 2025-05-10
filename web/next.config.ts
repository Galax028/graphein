import type { NextConfig } from "next";
const { i18n } = require("./next-i18next.config");

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/client",
        destination: "/client/dashboard",
        permanent: true,
      },
      {
        source: "/client/order/new",
        destination: "/client/order/new/upload",
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
    remotePatterns: [new URL("https://lh3.googleusercontent.com/**")],
  },
  reactStrictMode: true,
  i18n,
};

export default nextConfig;
