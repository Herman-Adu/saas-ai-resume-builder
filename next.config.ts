import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "b7pf7ojaqrlw1vpi.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
