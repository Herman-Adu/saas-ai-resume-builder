import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
      allowedOrigins: [
        //"localhost:3000",
        "c20ss67f-3000.uks1.devtunnels.ms",
        //"*",
      ],
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
