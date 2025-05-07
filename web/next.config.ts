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
        source: "/merchant",
        destination: "/merchant/dashboard",
        permanent: true,
      },
    ];
  },
  reactStrictMode: true,
  i18n,
};

export default nextConfig;
