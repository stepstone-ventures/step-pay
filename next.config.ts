import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Ensure JSON data files are included in the build
  experimental: {
    outputFileTracingIncludes: {
      "/*": ["./data/**/*"],
    },
  },
};

export default nextConfig;
