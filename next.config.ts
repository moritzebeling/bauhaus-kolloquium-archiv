import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    // next/image optimization is not available for static exports;
    // images are pre-processed by `npm run process-images` instead.
    unoptimized: true,
  },
};

export default nextConfig;
