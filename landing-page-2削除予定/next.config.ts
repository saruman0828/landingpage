import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source: "/right-hand-ai",
        destination: "/",
        permanent: true,
      },
      {
        source: "/variant-b",
        destination: "/two-days",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/main/index.html",
      },
    ];
  },
};

export default nextConfig;
