import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  typescript: {
    ignoreBuildErrors: true, // set true temporarily if needed
  },
};

export default nextConfig;
