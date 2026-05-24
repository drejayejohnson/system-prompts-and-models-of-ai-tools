import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Electron to load the app from file:// in production
  output: process.env.ELECTRON_BUILD ? "export" : undefined,
  trailingSlash: process.env.ELECTRON_BUILD === "true",
  images: {
    unoptimized: process.env.ELECTRON_BUILD === "true",
  },
};

export default nextConfig;
