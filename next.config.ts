import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use 'export' for GitHub Pages, 'standalone' for Vercel/Docker
  output: process.env.NEXT_EXPORT ? "export" : "standalone",
  
  // For GitHub Pages static export
  ...(process.env.NEXT_EXPORT && {
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
  }),
  
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
