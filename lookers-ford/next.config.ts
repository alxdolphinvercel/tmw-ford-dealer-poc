import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // All pages are statically pre-rendered (SSG). Deployed to Vercel,
  // next/image optimization stays available.
  reactStrictMode: true,
};

export default nextConfig;
