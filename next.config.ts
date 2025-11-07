import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for Docker deployment
  // This creates a minimal production build with only necessary files
  output: "standalone",

  // Other config options
  // Add more configuration as needed
};

export default nextConfig;
